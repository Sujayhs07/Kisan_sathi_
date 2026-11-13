# Kisan Scheme Saathi — Spring Boot Enterprise Backend (ಕಿಸಾನ್ ಸ್ಕೀಮ್ ಸಾಥಿ)

Production-grade Java Spring Boot 3.4.2 backend implementing an explainable, deterministic rules engine and agricultural scheme management system for **Karnataka, India**.

---

## 🏛️ Architecture Overview

- **Framework**: Spring Boot 3.4.2 (Spring 6)
- **Runtime**: Java 17 or Java 21 LTS
- **Database**: PostgreSQL 14+ with Flyway additive migrations (`V1__...`, `V2__...`)
- **Security**: Stateless JWT (`io.jsonwebtoken:jjwt 0.12.6`), BCrypt / PBKDF2 password hashing, SMS OTP verification with HMAC
- **Caching**: Caffeine High-Performance In-Memory Cache with `@EnableCaching` (30-minute TTL, evictions, hit/miss stats)
- **API Documentation**: OpenAPI 3 / Swagger (`springdoc-openapi 2.8.3`)
- **SMS Gateways**: Multi-provider support (Fast2SMS, MSG91, Twilio) with fallback and rate-limiting

---

## 📁 Package Structure

```
backend/
├── pom.xml
└── src/
    ├── main/
    │   ├── java/com/kisanscheme/saathi/
    │   │   ├── KisanSchemeSaathiApplication.java
    │   │   ├── config/
    │   │   │   └── CacheConfig.java            # Caffeine cache setup & TTLs
    │   │   ├── controller/
    │   │   │   ├── ApplicationController.java   # /applications (tracking user applications)
    │   │   │   ├── AuthController.java          # /auth (phone, username, OTP, JWT)
    │   │   │   ├── NotificationController.java  # /notifications (in-app alerts)
    │   │   │   ├── ReminderController.java      # /reminders (deadline reminders)
    │   │   │   ├── SavedSchemeController.java   # /saved-schemes (bookmarking & custom notes)
    │   │   │   └── SchemeController.java        # /schemes (public catalog & checklists)
    │   │   ├── evaluator/
    │   │   │   └── DeterministicEligibilityEngine.java # Authoritative deterministic rule matcher
    │   │   ├── model/                           # JPA Entities (User, SavedScheme, ApplicationRecord, etc.)
    │   │   ├── repository/                      # Spring Data JPA Repositories
    │   │   ├── rules/                           # RuleCondition, RuleOperator
    │   │   ├── security/                        # JwtService, JwtAuthenticationFilter, SecurityConfig
    │   │   ├── service/                         # AuthOtpService, SchemeCatalogService, DeadlineReminderSchedulerService
    │   │   ├── sms/                             # Fast2SmsProvider, Msg91SmsProvider, TwilioSmsProvider
    │   │   └── utils/                           # IndianPhoneValidator
    │   └── resources/
    │       ├── application.properties           # Server, DB, JWT, SMS, & Gemini properties
    │       ├── schema.sql
    │       ├── db/migration/
    │       │   ├── V1__baseline_existing_tables.sql
    │       │   └── V2__phone_otp_deadlines_notifications.sql
    │       └── schemes/
    │           └── karnataka-schemes.json       # Official Karnataka verified schemes database
    └── test/                                    # JUnit 5 & Mockito test suites
```

---

## ⚙️ Configuration & Prerequisites

### 1. Prerequisites
- **JDK**: Java 17 or Java 21 LTS installed (`java -version`)
- **Maven**: 3.8+ installed (`mvn -version`)
- **PostgreSQL Server**: 14+ running on `localhost:5432`

### 2. Database Setup
Create the PostgreSQL database:
```sql
CREATE DATABASE kisan_saathi_db WITH ENCODING 'UTF8';
```

### 3. Environment Variables
You can configure these via system environment variables or inside `src/main/resources/application.properties`:
```properties
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kisan_saathi_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password

JWT_SECRET=your_minimum_32_byte_random_secret_key_here
SMS_PROVIDER=fast2sms # or msg91, twilio
FAST2SMS_API_KEY=your_key
```

---

## 🚀 Running the Java Backend

### Option A: Using Maven CLI
```bash
cd backend
mvn clean install -DskipTests
mvn spring-boot:run
```

### Option B: Running the Packaged JAR
```bash
cd backend
mvn clean package -DskipTests
java -jar target/kisan-scheme-saathi-backend-1.0.0-SNAPSHOT.jar
```

The Spring Boot server will start on **`http://localhost:8080/api`**.

---

## 📖 API Documentation & Swagger UI

Once the backend is running, open:
- **Swagger UI**: `http://localhost:8080/api/swagger-ui.html`
- **OpenAPI JSON**: `http://localhost:8080/api/v3/api-docs`

---

## 🧪 Running Automated Tests

```bash
cd backend
mvn test
```
Runs:
- `OtpAndDeadlineServiceTest`: Validates OTP verification, rate limiting, and deadline calculation.
- `SchemeCatalogCacheTest`: Tests Caffeine in-memory caching and cache invalidation.
