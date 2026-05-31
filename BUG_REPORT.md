# AI SERVICES MARKETPLACE - BUG REPORT & DEFECT LOG

**Project:** AI Services Marketplace  
**Date:** May 30, 2026  
**QA Specialist:** QA Team / Antigravity AI  
**Scope:** Remote Production Instance (`http://3.27.209.83`)  
**Testing Framework:** Playwright E2E & Remote Server Diagnostics  

---

## 1. SUMMARY OF DEFECTS DISCOVERED

This report lists the technical defects, caching discrepancies, and testing mismatches discovered during browser-driven E2E automation and code structure reviews of the **AI Services Marketplace** platform. 

> [!IMPORTANT]
> **No modifications have been made to the source code.** As per the strict instruction, all defects are documented here with detailed stack traces, file locations, impact assessments, and suggested resolutions.

### Defect Heatmap

| ID | Title | Component | Severity | Impact |
| :--- | :--- | :--- | :--- | :--- |
| **BUG-001** | [Spring PageImpl Deserialization Crash](#bug-001-spring-pageimpl-deserialization-crash-on-marketplace) | Backend (Redis Cache) | **CRITICAL** | Completely blocks service marketplace browsing |
| **BUG-002** | [Stale Public User Profile Cache](#bug-002-stale-public-user-profile-cache-inconsistency) | Backend (Caching Eviction) | **HIGH** | Updated profiles remain stale on public pages |
| **BUG-003** | [Pre-seeded QA Account Credential Fails](#bug-003-pre-seeded-qa-account-credentials-failure) | Database / QA Setup | **HIGH** | Static login tests fail with 401 Unauthorized |
| **BUG-004** | [AI Cache Key Hash Code Collision Risk](#bug-004-ai-cache-key-hash-code-collision-risk) | Backend (AI Module) | **MEDIUM** | Possible incorrect AI responses due to hash collisions |
| **BUG-005** | [Job Creation Status Flow Mismatch](#bug-005-job-creation-initial-status-flow-mismatch) | Frontend / Backend | **MEDIUM** | Mismatch between QA expectations and code behavior |

---

## 2. DETAILED DEFECT LOGS

### BUG-001: Spring PageImpl Deserialization Crash on Marketplace

- **File Link**: [ExpertServiceService.java:L108-L120](file:///c:/Users/trong/Documents/swp391/AI-freelanecer/backend/src/main/java/com/aimarket/service/ExpertServiceService.java#L108-L120)
- **Component**: `aimarket-backend` (Spring Cache + GenericJackson2JsonRedisSerializer)
- **Severity**: `CRITICAL`
- **Symptom**: 
  When accessing or filtering the `/marketplace` service browser page, the UI reports `"Error loading services. Please try again."` and blocks the user from searching or viewing available AI services.
- **Root Cause**:
  The `browseMarketplace` method is annotated with `@Cacheable` to cache lists of services page-by-page in Redis:
  ```java
  @Cacheable(value = "services", key = "#keyword + '-' + #minPrice + '-' + #maxPrice + '-' + #page")
  public Page<ServiceResponse> browseMarketplace(...)
  ```
  The method returns a Spring Data `org.springframework.data.domain.PageImpl`. However, `PageImpl` does not have a default zero-argument constructor, nor does it have properties that standard Jackson can deserialize without custom mapping configuration. When the application tries to fetch subsequent requests from the Redis cache, Jackson throws an `InvalidDefinitionException`.

- **Raw Server Exception Trace**:
  ```java
  Caused by: com.fasterxml.jackson.databind.exc.InvalidDefinitionException: Cannot construct instance of `org.springframework.data.domain.PageImpl` (no Creators, like default constructor, exist): cannot deserialize from Object value (no delegate- or property-based Creator)
      at com.fasterxml.jackson.databind.exc.InvalidDefinitionException.from(InvalidDefinitionException.java:67) ~[jackson-databind-2.17.1.jar!/:2.17.1]
      at com.fasterxml.jackson.databind.DeserializationContext.reportBadDefinition(DeserializationContext.java:1887) ~[jackson-databind-2.17.1.jar!/:2.17.1]
      ...
      at org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer.deserialize(GenericJackson2JsonRedisSerializer.java:289) ~[spring-data-redis-3.3.0.jar!/:3.3.0]
  ```

- **Suggested Resolution**:
  Instead of returning the generic Spring `PageImpl` directly to the cache, return a custom serializable DTO (e.g., `PageResponse<ServiceResponse>`) that has a standard default constructor and getters/setters, or register a custom Jackson mixin/module in `CacheConfig.java` to support deserialization of `PageImpl`.

---

### BUG-002: Stale Public User Profile Cache Inconsistency

- **File Link**: [UserProfileService.java:L25-L73](file:///c:/Users/trong/Documents/swp391/AI-freelanecer/backend/src/main/java/com/aimarket/service/UserProfileService.java#L25-L73)
- **Component**: `aimarket-backend` (Profile Caching)
- **Severity**: `HIGH`
- **Symptom**:
  When a user updates their profile details (e.g. bio, hourly rate, or avatar), the changes are successfully saved to the database but do not show up on the public profile view or public marketplace cards for up to 10 minutes.
- **Root Cause**:
  In `UserProfileService.java`, public profile requests are cached using the key `'pub:' + #userId`:
  ```java
  @Cacheable(value = "user-profiles", key = "'pub:' + #userId")
  public UserProfileResponse getPublicProfile(Long userId) { ... }
  ```
  However, the cache eviction annotations on `updateProfile` and `setAvailability` only evict the non-public cache key `#userId`:
  ```java
  @CacheEvict(value = "user-profiles", key = "#userId")
  public UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request) { ... }
  ```
  The cache key `'pub:' + #userId` is never evicted, leaving public views stale.

- **Suggested Resolution**:
  Configure `@CacheEvict` in update methods to evict both cache keys, or use `@Caching` to apply multiple evictions:
  ```java
  @Caching(evict = {
      @CacheEvict(value = "user-profiles", key = "#userId"),
      @CacheEvict(value = "user-profiles", key = "'pub:' + #userId")
  })
  ```

---

### BUG-003: Pre-seeded QA Account Credentials Failure

- **File Link**: [TEST_CASES_AI_MARKETPLACE.md:L1273-L1280](file:///c:/Users/trong/Documents/swp391/AI-freelanecer/TEST_CASES_AI_MARKETPLACE.md#L1273-L1280)
- **Component**: Database / QA Config
- **Severity**: `HIGH`
- **Symptom**:
  Standard static test suites (like `client-journey.spec.ts` and `expert-journey.spec.ts`) fail to login when using the documented credentials:
  - Client: `client@test.com` / `Test@12345`
  - Expert: `expert@test.com` / `Test@12345`
  
  The login API returns `401 Unauthorized` with the message `"Invalid email or password. Please try again."`
- **Root Cause**:
  The remote database (`aimarket-db`) does not contain these accounts, or their password hashes do not match the BCrypt translation of the documented string `Test@12345`.
- **Suggested Resolution**:
  Seed the remote MySQL RDS database with the appropriate BCrypt hashes for `Test@12345` or update the static credentials inside `TEST_CASES_AI_MARKETPLACE.md` to match the actual seeded database records.
  
  > [!TIP]
  > As a workaround, our dynamic test suites successfully registered accounts on the fly (e.g. `client_171698...@example.com`) which bypassed this error and completed downstream actions (job creation/browsing).

---

### BUG-004: AI Cache Key Hash Code Collision Risk

- **File Link**: [AIJobAssistantService.java:L42](file:///c:/Users/trong/Documents/swp391/AI-freelanecer/backend/src/main/java/com/aimarket/service/AIJobAssistantService.java#L42)
- **Component**: `aimarket-backend` (AI Cache)
- **Severity**: `MEDIUM`
- **Symptom**:
  Potential cache poisoning or incorrect suggestions returned to clients.
- **Root Cause**:
  The AI job enhancer caches suggestions using the sum of the hash codes of the title and description:
  ```java
  @Cacheable(value = "ai-job-enhance", key = "#title.hashCode() + #description.hashCode()")
  ```
  Java's `String.hashCode()` returns a 32-bit signed integer. Summing two hash codes together greatly increases the frequency of hash collisions. If two distinct job drafts collide, user A will receive cached recommendations generated for user B's draft.
- **Suggested Resolution**:
  Use a safer cache key generator or compute a secure hash (e.g., SHA-256) of the combined inputs as the Redis key.

---

### BUG-005: Job Creation Initial Status Flow Mismatch

- **File Link**: [JobService.java:L60](file:///c:/Users/trong/Documents/swp391/AI-freelanecer/backend/src/main/java/com/aimarket/service/JobService.java#L60) & [TEST_CASES_AI_MARKETPLACE.md:L69](file:///c:/Users/trong/Documents/swp391/AI-freelanecer/TEST_CASES_AI_MARKETPLACE.md#L69)
- **Component**: Frontend / Backend Flow
- **Severity**: `MEDIUM`
- **Symptom**:
  QA Test Case `TC-JOB-001` expects a newly created job to immediately appear on the public marketplace in `"Open"` status. However, the system actually creates jobs in the `"DRAFT"` status. They do not appear on the marketplace until the client visits the details page and clicks `"🚀 Publish Project"`.
- **Root Cause**:
  This is a design vs. documentation mismatch. The code uses a safer draft-to-publish flow, whereas the test case expects instant publication.
- **Suggested Resolution**:
  Align `TEST_CASES_AI_MARKETPLACE.md` to reflect the 2-step publish flow, or modify the frontend form submission to automatically trigger the publish mutation after creation if instant publishing is preferred.

---

## 3. VERIFICATION & REPRODUCIBILITY RESULTS

Dynamic automation scripts were executed successfully against `http://3.27.209.83`:

- **TC-AUTH-001**: Passed. Correctly caught invalid login errors.
- **TC-CLIENT-FLOW**: Passed (Dynamic Registration + Job Creation as Draft).
- **TC-EXPERT-FLOW**: Passed (Dynamic Registration + Service Form validation).
- **TC-MKT-001 & TC-MKT-002**: Caught **BUG-001** (Error loading services message captured gracefully on screen).

*Report prepared and compiled by Antigravity AI.*
