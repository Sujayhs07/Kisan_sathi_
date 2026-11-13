package com.kisanscheme.saathi.evaluator;

import com.kisanscheme.saathi.rules.RuleCondition;
import com.kisanscheme.saathi.rules.RuleOperator;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Deterministic Rules Evaluation Engine
 * Pure authoritative decision maker for farmer scheme eligibility.
 */
@Service
public class DeterministicEligibilityEngine {

    public enum Status {
        ELIGIBLE,
        LIKELY_ELIGIBLE,
        NOT_ELIGIBLE
    }

    public record ConditionResult(
        RuleCondition condition,
        boolean satisfied,
        Object actualValue,
        boolean isUnknown,
        String reasonEn,
        String reasonKn
    ) {}

    public record SchemeEvaluationResult(
        String schemeId,
        String schemeNameEn,
        String schemeNameKn,
        Status status,
        List<ConditionResult> satisfiedConditions,
        List<ConditionResult> failedConditions,
        List<ConditionResult> unknownConditions,
        boolean verificationRequired,
        String summaryEn,
        String summaryKn,
        String nextActionEn,
        String nextActionKn
    ) {
        public boolean isEligible() {
            return status == Status.ELIGIBLE || status == Status.LIKELY_ELIGIBLE;
        }

        public String getSchemeName() {
            return schemeNameEn;
        }
    }

    public ConditionResult evaluateCondition(RuleCondition condition, Map<String, Object> profile) {
        Object actualValue = profile.get(condition.field());

        if (actualValue == null) {
            return new ConditionResult(
                condition,
                false,
                null,
                true,
                "Information for '" + condition.titleEn() + "' was not provided.",
                "'" + condition.titleKn() + "' ಮಾಹಿತಿಯನ್ನು ಒದಗಿಸಲಾಗಿಲ್ಲ."
            );
        }

        boolean satisfied = false;
        RuleOperator op = condition.operator();

        try {
            switch (op) {
                case EQUALS -> satisfied = Objects.equals(actualValue.toString().trim(), condition.expectedValue().toString().trim());
                case NOT_EQUALS -> satisfied = !Objects.equals(actualValue.toString().trim(), condition.expectedValue().toString().trim());
                case GREATER_THAN_OR_EQUAL -> {
                    double actual = Double.parseDouble(actualValue.toString().replaceAll("[^0-9.]", ""));
                    double expected = Double.parseDouble(condition.expectedValue().toString());
                    satisfied = actual >= expected;
                }
                case LESS_THAN_OR_EQUAL -> {
                    double actual = Double.parseDouble(actualValue.toString().replaceAll("[^0-9.]", ""));
                    double expected = Double.parseDouble(condition.expectedValue().toString());
                    satisfied = actual <= expected;
                }
                case BOOLEAN_TRUE -> satisfied = Boolean.parseBoolean(actualValue.toString());
                case BOOLEAN_FALSE -> satisfied = !Boolean.parseBoolean(actualValue.toString());
                case IN -> {
                    if (condition.expectedValue() instanceof Collection<?> col) {
                        satisfied = col.contains(actualValue.toString());
                    } else if (condition.expectedValue() instanceof Object[] arr) {
                        satisfied = Arrays.asList(arr).contains(actualValue.toString());
                    }
                }
                case NOT_IN -> {
                    if (condition.expectedValue() instanceof Collection<?> col) {
                        satisfied = !col.contains(actualValue.toString());
                    } else if (condition.expectedValue() instanceof Object[] arr) {
                        satisfied = !Arrays.asList(arr).contains(actualValue.toString());
                    }
                }
            }
        } catch (Exception e) {
            satisfied = false;
        }

        String reasonEn = satisfied
            ? "Requirement met: " + condition.titleEn()
            : "Requirement failed: " + condition.titleEn() + " (Actual: " + actualValue + ", Required: " + condition.expectedValue() + ")";
        String reasonKn = satisfied
            ? "ಷರತ್ತು ಪೂರ್ಣಗೊಂಡಿದೆ: " + condition.titleKn()
            : "ಷರತ್ತು ಪೂರೈಸಿಲ್ಲ: " + condition.titleKn() + " (ವಾಸ್ತವ: " + actualValue + ")";

        return new ConditionResult(condition, satisfied, actualValue, false, reasonEn, reasonKn);
    }

    @SuppressWarnings("unchecked")
    public SchemeEvaluationResult evaluateScheme(Map<String, Object> scheme, Map<String, Object> profile) {
        String schemeId = String.valueOf(scheme.get("id"));
        String nameEn = String.valueOf(scheme.getOrDefault("nameEn", scheme.get("id")));
        String nameKn = String.valueOf(scheme.getOrDefault("nameKn", nameEn));
        List<Map<String, Object>> conditionsList = (List<Map<String, Object>>) scheme.get("conditions");

        List<ConditionResult> satisfied = new ArrayList<>();
        List<ConditionResult> failed = new ArrayList<>();
        List<ConditionResult> unknown = new ArrayList<>();

        boolean triggeredExclusion = false;
        boolean failedMandatory = false;

        if (conditionsList != null) {
            for (Map<String, Object> condMap : conditionsList) {
                RuleOperator op = RuleOperator.valueOf(String.valueOf(condMap.get("operator")));
                RuleCondition condition = new RuleCondition(
                        String.valueOf(condMap.get("id")),
                        String.valueOf(condMap.get("field")),
                        op,
                        condMap.get("expectedValue"),
                        Boolean.TRUE.equals(condMap.get("isMandatory")),
                        Boolean.TRUE.equals(condMap.get("isExclusion")),
                        Boolean.TRUE.equals(condMap.get("requiresOfficialVerification")),
                        String.valueOf(condMap.get("titleEn")),
                        String.valueOf(condMap.get("titleKn")),
                        String.valueOf(condMap.get("descriptionEn")),
                        String.valueOf(condMap.get("descriptionKn"))
                );

                ConditionResult res = evaluateCondition(condition, profile);
                if (res.isUnknown()) {
                    unknown.add(res);
                } else if (condition.isExclusion()) {
                    if (res.satisfied()) {
                        triggeredExclusion = true;
                        failed.add(res);
                    } else {
                        satisfied.add(res);
                    }
                } else {
                    if (res.satisfied()) {
                        satisfied.add(res);
                    } else {
                        if (condition.isMandatory()) {
                            failedMandatory = true;
                        }
                        failed.add(res);
                    }
                }
            }
        }

        Status status;
        String summaryEn;
        String summaryKn;
        String nextActionEn;
        String nextActionKn;

        if (triggeredExclusion || failedMandatory) {
            status = Status.NOT_ELIGIBLE;
            summaryEn = "Farmer profile does not satisfy mandatory eligibility condition(s) for " + nameEn + ".";
            summaryKn = "ರೈತರ ವಿವರಗಳು " + nameKn + " ಯೋಜನೆಯ ಕಡ್ಡಾಯ ನಿಯಮಗಳನ್ನು ಪೂರೈಸುತ್ತಿಲ್ಲ.";
            nextActionEn = "Review failed criteria or consult Raitha Samparka Kendra.";
            nextActionKn = "ಪೂರೈಸದ ನಿಯಮಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಅಥವಾ ರೈತ ಸಂಪರ್ಕ ಕೇಂದ್ರವನ್ನು ಸಂಪರ್ಕಿಸಿ.";
        } else if (!unknown.isEmpty()) {
            status = Status.LIKELY_ELIGIBLE;
            summaryEn = "Basic criteria satisfied; official government portal verification required.";
            summaryKn = "ಮೂಲ ಷರತ್ತುಗಳು ಸರಿಹೊಂದಿವೆ, ಅಧಿಕೃತ ಪರಿಶೀಲನೆ ಬಾಕಿ ಇದೆ.";
            nextActionEn = "Verify records on official portal: " + scheme.get("officialPortalUrl");
            nextActionKn = "ಅಧಿಕೃತ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ದಾಖಲೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ: " + scheme.get("officialPortalUrl");
        } else {
            status = Status.ELIGIBLE;
            summaryEn = "Farmer satisfies all mandatory eligibility conditions for " + nameEn + ".";
            summaryKn = "ರೈತರು " + nameKn + " ಯೋಜನೆಯ ಎಲ್ಲಾ ಕಡ್ಡಾಯ ನಿಯಮಗಳನ್ನು ಪೂರೈಸಿದ್ದಾರೆ.";
            nextActionEn = "Proceed to application and apply on official portal: " + scheme.get("officialPortalUrl");
            nextActionKn = "ಅಧಿಕೃತ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ: " + scheme.get("officialPortalUrl");
        }

        return new SchemeEvaluationResult(
                schemeId, nameEn, nameKn, status, satisfied, failed, unknown,
                status == Status.LIKELY_ELIGIBLE,
                summaryEn, summaryKn, nextActionEn, nextActionKn
        );
    }

    public List<SchemeEvaluationResult> evaluateAll(List<Map<String, Object>> schemes, Map<String, Object> profile) {
        List<SchemeEvaluationResult> results = new ArrayList<>();
        if (schemes == null) return results;
        for (Map<String, Object> scheme : schemes) {
            results.add(evaluateScheme(scheme, profile));
        }
        return results;
    }
}
