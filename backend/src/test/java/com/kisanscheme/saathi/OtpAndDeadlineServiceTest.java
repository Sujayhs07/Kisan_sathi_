package com.kisanscheme.saathi;

import com.kisanscheme.saathi.model.*;
import com.kisanscheme.saathi.repository.*;
import com.kisanscheme.saathi.security.JwtService;
import com.kisanscheme.saathi.service.AuthOtpService;
import com.kisanscheme.saathi.service.DeadlineReminderScheduler;
import com.kisanscheme.saathi.sms.SmsDeliveryResult;
import com.kisanscheme.saathi.sms.SmsGatewayService;
import com.kisanscheme.saathi.utils.IndianPhoneValidator;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OtpAndDeadlineServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private OtpVerificationRepository otpRepository;

    @Mock
    private SavedSchemeRepository savedSchemeRepository;

    @Mock
    private AppNotificationRepository notificationRepository;

    @Mock
    private ReminderDispatchLogRepository dispatchLogRepository;

    @Mock
    private SmsGatewayService smsGatewayService;

    @Mock
    private JwtService jwtService;

    @Test
    @DisplayName("IndianPhoneValidator: normalizes various formats to E.164 and rejects invalid numbers")
    void testPhoneNormalizationAndValidation() {
        assertEquals("+919845012345", IndianPhoneValidator.normalizeToE164("9845012345").orElse(null));
        assertEquals("+919845012345", IndianPhoneValidator.normalizeToE164("+91 98450 12345").orElse(null));
        assertEquals("+919845012345", IndianPhoneValidator.normalizeToE164("09845012345").orElse(null));
        assertEquals("+919845012345", IndianPhoneValidator.normalizeToE164("919845012345").orElse(null));

        assertTrue(IndianPhoneValidator.normalizeToE164("1234567890").isEmpty()); // Invalid starting digit
        assertTrue(IndianPhoneValidator.normalizeToE164("+14155551234").isEmpty()); // Non-Indian international
        assertTrue(IndianPhoneValidator.normalizeToE164("").isEmpty());
        assertTrue(IndianPhoneValidator.normalizeToE164(null).isEmpty());

        // Username validator check
        assertTrue(IndianPhoneValidator.isValidUsername("ramesh_patil"));
        assertTrue(IndianPhoneValidator.isValidUsername("farmer.123"));
        assertFalse(IndianPhoneValidator.isValidUsername("ab")); // Too short (< 3)
        assertFalse(IndianPhoneValidator.isValidUsername("farmer@gmail")); // Special character '@' not allowed

        // Phone masking check
        assertEquals("+91 ••••••2345", IndianPhoneValidator.maskPhone("+919845012345"));
    }

    @Test
    @DisplayName("AuthOtpService: initiates registration, hashes OTP with HMAC-SHA256, and activates user")
    void testRegistrationOtpIssuanceAndVerification() {
        PasswordEncoder encoder = new BCryptPasswordEncoder(10);
        String hmacSecret = "super-secret-hmac-key-for-unit-testing-32-chars";

        AuthOtpService service = new AuthOtpService(
            userRepository,
            otpRepository,
            encoder,
            smsGatewayService,
            jwtService,
            hmacSecret
        );

        when(userRepository.findByUsernameIgnoreCase("new_farmer")).thenReturn(Optional.empty());
        when(userRepository.findByPhoneNumber("+919845099887")).thenReturn(Optional.empty());
        when(otpRepository.findByPhoneNumberAndPurposeAndInvalidatedFalseAndUsedAtIsNull(anyString(), any()))
            .thenReturn(List.of());
        when(smsGatewayService.sendOtp(eq("+919845099887"), anyString(), anyInt()))
            .thenReturn(new SmsDeliveryResult(true, true, "MSG91", "Dispatched"));

        ArgumentCaptor<OtpVerification> otpCaptor = ArgumentCaptor.forClass(OtpVerification.class);
        when(otpRepository.save(otpCaptor.capture())).thenAnswer(inv -> inv.getArgument(0));

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        when(userRepository.save(userCaptor.capture())).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            if (u.getId() == null) u.setId("usr_test_101");
            return u;
        });

        // 1. Initiate Farmer Registration
        AuthOtpService.OtpDispatchOutcome outcome = service.registerPendingFarmer(
            "new_farmer",
            "Ramesh Gowda",
            "9845099887",
            "Strong@123",
            "Strong@123",
            true,
            "Mandya",
            "kn"
        );

        assertTrue(outcome.success());
        assertEquals(200, outcome.httpStatus());
        assertEquals("+919845099887", outcome.phoneNumber());

        OtpVerification capturedOtp = otpCaptor.getValue();
        assertNotNull(capturedOtp);
        assertEquals(OtpPurpose.REGISTRATION_VERIFY, capturedOtp.getPurpose());
        assertEquals("+919845099887", capturedOtp.getPhoneNumber());
        assertNotNull(capturedOtp.getOtpHash());
        assertTrue(capturedOtp.getExpiresAt().isAfter(LocalDateTime.now().plusMinutes(4)));

        // 2. Mock pending user in repository for verification
        User pendingUser = userCaptor.getValue();
        assertFalse(pendingUser.isPhoneVerified());
        assertEquals(AccountStatus.PENDING_VERIFICATION, pendingUser.getAccountStatus());

        when(otpRepository.findTopByPhoneNumberAndPurposeAndInvalidatedFalseAndUsedAtIsNullOrderByCreatedAtDesc(
            eq("+919845099887"), eq(OtpPurpose.REGISTRATION_VERIFY)
        )).thenReturn(Optional.of(capturedOtp));
        when(userRepository.findByPhoneNumber("+919845099887")).thenReturn(Optional.of(pendingUser));
        when(jwtService.generateToken(any(User.class))).thenReturn("mock-jwt-token-xyz");

        // 3. Test wrong OTP rejection
        AuthOtpService.AuthOutcome wrongOtpOutcome = service.verifyRegistrationOtp("9845099887", "000000");
        assertFalse(wrongOtpOutcome.success());
        assertEquals(400, wrongOtpOutcome.httpStatus());
        assertEquals(1, capturedOtp.getAttempts(), "Attempts counter should increment on failed verification");
    }

    @Test
    @DisplayName("DeadlineReminderScheduler: dispatches in-app notification when approaching verified deadline")
    void testDeadlineReminderProcessing() {
        DeadlineReminderScheduler scheduler = new DeadlineReminderScheduler(
            savedSchemeRepository,
            notificationRepository,
            dispatchLogRepository,
            smsGatewayService
        );

        User farmer = new User();
        farmer.setId("usr_active_farmer");
        farmer.setAccountStatus(AccountStatus.ACTIVE);
        farmer.setPhoneVerified(true);
        farmer.setPhoneNumber("+919845012345");
        farmer.setSmsRemindersEnabled(false);

        SavedScheme saved = new SavedScheme();
        saved.setId("saved_scheme_1");
        saved.setUser(farmer);
        saved.setSchemeId("pmfby-samrakshane");
        saved.setSchemeNameSnapshot("Pradhan Mantri Fasal Bima Yojana");
        saved.setReminderEnabled(true);
        saved.setReminderDismissed(false);
        saved.setDeadlineVerified(true);
        saved.setApplicationDeadline(LocalDate.now().plusDays(3)); // 3 days remaining
        saved.setReminderDaysBefore("30,7,3,1");

        when(savedSchemeRepository.findAll()).thenReturn(List.of(saved));
        when(dispatchLogRepository.existsByUserIdAndSchemeIdAndThresholdDaysAndTargetDeadlineAndChannel(
            eq("usr_active_farmer"), eq("pmfby-samrakshane"), eq(3), any(LocalDate.class), eq("IN_APP")
        )).thenReturn(false);

        ArgumentCaptor<AppNotification> notifCaptor = ArgumentCaptor.forClass(AppNotification.class);
        ArgumentCaptor<ReminderDispatchLog> logCaptor = ArgumentCaptor.forClass(ReminderDispatchLog.class);

        scheduler.processUpcomingDeadlines();

        verify(notificationRepository).save(notifCaptor.capture());
        verify(dispatchLogRepository).save(logCaptor.capture());
        verify(savedSchemeRepository).save(saved);

        AppNotification createdNotif = notifCaptor.getValue();
        assertEquals("usr_active_farmer", createdNotif.getUser().getId());
        assertEquals("pmfby-samrakshane", createdNotif.getSchemeId());
        assertEquals("RED", createdNotif.getUrgency(), "3 days remaining should trigger RED urgency");
        assertEquals(3, createdNotif.getDaysRemaining());

        ReminderDispatchLog createdLog = logCaptor.getValue();
        assertEquals(3, createdLog.getThresholdDays());
        assertEquals("IN_APP", createdLog.getChannel());
    }
}
