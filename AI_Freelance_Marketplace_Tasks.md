# AI Freelance Marketplace — Task Breakdown & Prompt Chi Tiết

> **Stack:** React 18 + Vite (Frontend) | Spring Boot 3.x + Maven (Backend) | MySQL 8 (Database) | Docker + Docker Compose | AWS (EC2, RDS MySQL, ElastiCache Redis, S3)
> **Tổng:** 8 Sprints × 2 tuần = 16 tuần

---

## SPRINT 1 — Project Setup, Auth, User Profile

---

### TASK-01 · Khởi tạo dự án & Docker Compose

**Mục tiêu:** Tạo cấu trúc thư mục toàn bộ dự án, cấu hình Docker Compose cho môi trường local dev.

**Prompt:**

```
Bạn là một senior DevOps engineer. Hãy tạo cấu trúc dự án đầy đủ cho hệ thống AI Freelance Marketplace với các yêu cầu sau:

1. BACKEND (Spring Boot 3.x + Maven):
   - Tạo file pom.xml với các dependencies: spring-boot-starter-web, spring-boot-starter-data-jpa, spring-boot-starter-security, spring-boot-starter-websocket, spring-boot-starter-validation, mysql-connector-j, jjwt (0.12.x), lombok, mapstruct, springdoc-openapi-ui, spring-boot-starter-data-redis, aws-java-sdk-s3.
   - Cấu trúc package: com.aimarket.{config, controller, service, repository, entity, dto, exception, security, websocket, ai, scheduler, util}
   - File application.yml với profiles: dev, prod
   - application-dev.yml: datasource MySQL localhost:3306/aimarket_db, redis localhost:6379, logging DEBUG

2. FRONTEND (React 18 + Vite):
   - package.json với: react, react-dom, react-router-dom v6, @tanstack/react-query, zustand, axios, tailwindcss, @radix-ui/react-*, lucide-react, sockjs-client, @stomp/stompjs, typescript
   - Cấu trúc thư mục: src/{api, components, pages, features, store, hooks, utils, types}
   - vite.config.ts với proxy /api -> http://localhost:8080
   - tailwind.config.ts với theme màu tùy chỉnh

3. DOCKER COMPOSE (docker-compose.yml):
   - Service mysql: image mysql:8.0, port 3306:3306, env MYSQL_DATABASE=aimarket_db, MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}, volume ./data/mysql:/var/lib/mysql, healthcheck
   - Service redis: image redis:7-alpine, port 6379:6379
   - Service backend: build từ ./backend/Dockerfile, port 8080:8080, depends_on mysql (condition: service_healthy), redis, env từ .env file
   - Service frontend: build từ ./frontend/Dockerfile, port 3000:3000, depends_on backend
   - Service adminer: image adminer, port 8081:8080 (chỉ dev)
   - Networks: aimarket-network (bridge)

4. DOCKERFILE BACKEND (multi-stage):
   - Stage 1 (build): FROM maven:3.9-eclipse-temurin-21 AS build, WORKDIR /app, COPY pom.xml ., RUN mvn dependency:go-offline, COPY src ./src, RUN mvn package -DskipTests
   - Stage 2 (run): FROM eclipse-temurin:21-jre-alpine, COPY --from=build /app/target/*.jar app.jar, EXPOSE 8080, ENTRYPOINT ["java", "-jar", "/app.jar"]

5. DOCKERFILE FRONTEND (multi-stage):
   - Stage 1 (build): FROM node:20-alpine AS build, npm ci, npm run build
   - Stage 2 (serve): FROM nginx:alpine, COPY dist/ /usr/share/nginx/html/, COPY nginx.conf /etc/nginx/conf.d/default.conf, EXPOSE 80
   - nginx.conf: try_files $uri /index.html (hỗ trợ React Router)

6. File .env.example với tất cả biến môi trường cần thiết.
7. File .dockerignore cho cả backend (target/, *.iml) và frontend (node_modules/, dist/).
8. File .gitignore phù hợp.
9. README.md với hướng dẫn khởi động: docker-compose up --build

Đảm bảo tất cả service có thể chạy với lệnh duy nhất: docker-compose up --build
```

---

### TASK-02 · Database Schema — Migration với Flyway

**Mục tiêu:** Tạo toàn bộ schema MySQL 8 qua Flyway migration.

**Prompt:**

```
Bạn là DBA chuyên MySQL. Hãy tạo Flyway migration scripts cho hệ thống AI Freelance Marketplace:

File: src/main/resources/db/migration/V1__init_schema.sql

Tạo đầy đủ 15 bảng theo thứ tự phụ thuộc FK:

1. skills (id BIGINT PK AUTO_INCREMENT, category VARCHAR(100), name VARCHAR(100) UNIQUE NOT NULL, created_at DATETIME DEFAULT NOW())

2. users (id BIGINT PK AUTO_INCREMENT, email VARCHAR(255) UNIQUE NOT NULL, password_hash VARCHAR(255) NOT NULL, role ENUM('CLIENT','EXPERT','ADMIN') NOT NULL, status ENUM('ACTIVE','SUSPENDED','PENDING') DEFAULT 'PENDING', email_verified BOOLEAN DEFAULT FALSE, created_at DATETIME DEFAULT NOW(), updated_at DATETIME DEFAULT NOW() ON UPDATE NOW())

3. user_profiles (id BIGINT PK, user_id BIGINT UNIQUE FK->users.id ON DELETE CASCADE, full_name VARCHAR(255), bio TEXT, avatar_url VARCHAR(500), portfolio_url VARCHAR(500), hourly_rate DECIMAL(10,2), rating DECIMAL(3,2) DEFAULT 0.00, total_reviews INT DEFAULT 0, completion_rate DECIMAL(5,2) DEFAULT 0.00, is_available BOOLEAN DEFAULT TRUE, skills_embedding JSON COMMENT 'Vector embedding for AI recommendation', created_at DATETIME, updated_at DATETIME)

4. user_skills (user_id BIGINT FK->users.id, skill_id BIGINT FK->skills.id, PRIMARY KEY(user_id, skill_id))

5. jobs (id BIGINT PK AUTO_INCREMENT, client_id BIGINT FK->users.id, title VARCHAR(255) NOT NULL, description TEXT NOT NULL, budget_min DECIMAL(15,2), budget_max DECIMAL(15,2), deadline DATE, status ENUM('DRAFT','OPEN','IN_PROGRESS','COMPLETED','CANCELLED') DEFAULT 'DRAFT', ai_enhanced BOOLEAN DEFAULT FALSE, view_count INT DEFAULT 0, created_at DATETIME, updated_at DATETIME)

6. job_skills (job_id BIGINT FK->jobs.id ON DELETE CASCADE, skill_id BIGINT FK->skills.id, PRIMARY KEY(job_id, skill_id))

7. services (id BIGINT PK AUTO_INCREMENT, expert_id BIGINT FK->users.id, title VARCHAR(255) NOT NULL, description TEXT, price DECIMAL(15,2) NOT NULL, delivery_days INT NOT NULL, status ENUM('ACTIVE','INACTIVE','PENDING_REVIEW') DEFAULT 'PENDING_REVIEW', tags JSON, rating DECIMAL(3,2) DEFAULT 0.00, order_count INT DEFAULT 0, skills_embedding JSON, created_at DATETIME, updated_at DATETIME)

8. proposals (id BIGINT PK AUTO_INCREMENT, job_id BIGINT FK->jobs.id, expert_id BIGINT FK->users.id, price DECIMAL(15,2) NOT NULL, timeline_days INT NOT NULL, cover_letter TEXT, status ENUM('PENDING','ACCEPTED','REJECTED','WITHDRAWN') DEFAULT 'PENDING', created_at DATETIME, updated_at DATETIME, UNIQUE KEY uq_proposal(job_id, expert_id))

9. contracts (id BIGINT PK AUTO_INCREMENT, job_id BIGINT FK->jobs.id, proposal_id BIGINT UNIQUE FK->proposals.id, client_id BIGINT FK->users.id, expert_id BIGINT FK->users.id, total_amount DECIMAL(15,2) NOT NULL, status ENUM('ACTIVE','COMPLETED','DISPUTED','CANCELLED') DEFAULT 'ACTIVE', started_at DATETIME, completed_at DATETIME, created_at DATETIME)

10. milestones (id BIGINT PK AUTO_INCREMENT, contract_id BIGINT FK->contracts.id ON DELETE CASCADE, name VARCHAR(255) NOT NULL, description TEXT, amount DECIMAL(15,2) NOT NULL, due_date DATE, status ENUM('PENDING','IN_PROGRESS','SUBMITTED','APPROVED','REJECTED') DEFAULT 'PENDING', deliverable_url VARCHAR(500), deliverable_note TEXT, order_index INT DEFAULT 0, created_at DATETIME, updated_at DATETIME)

11. escrow_accounts (id BIGINT PK AUTO_INCREMENT, user_id BIGINT UNIQUE FK->users.id, balance DECIMAL(15,2) DEFAULT 0.00, locked_amount DECIMAL(15,2) DEFAULT 0.00, total_deposited DECIMAL(15,2) DEFAULT 0.00, total_released DECIMAL(15,2) DEFAULT 0.00, currency CHAR(3) DEFAULT 'USD', updated_at DATETIME)

12. transactions (id BIGINT PK AUTO_INCREMENT, user_id BIGINT FK->users.id, contract_id BIGINT FK->contracts.id NULLABLE, milestone_id BIGINT FK->milestones.id NULLABLE, type ENUM('DEPOSIT','ESCROW_LOCK','RELEASE','REFUND','FEE','WITHDRAW') NOT NULL, amount DECIMAL(15,2) NOT NULL, currency CHAR(3) DEFAULT 'USD', status ENUM('PENDING','SUCCESS','FAILED') DEFAULT 'PENDING', ref_code VARCHAR(100), note TEXT, created_at DATETIME)

13. messages (id BIGINT PK AUTO_INCREMENT, contract_id BIGINT FK->contracts.id, sender_id BIGINT FK->users.id, content TEXT NOT NULL, is_read BOOLEAN DEFAULT FALSE, created_at DATETIME, INDEX idx_messages_contract(contract_id, created_at))

14. reviews (id BIGINT PK AUTO_INCREMENT, contract_id BIGINT UNIQUE FK->contracts.id, reviewer_id BIGINT FK->users.id, reviewee_id BIGINT FK->users.id, rating TINYINT NOT NULL CHECK(rating BETWEEN 1 AND 5), comment TEXT, created_at DATETIME)

15. disputes (id BIGINT PK AUTO_INCREMENT, contract_id BIGINT FK->contracts.id, opened_by BIGINT FK->users.id, reason TEXT NOT NULL, status ENUM('OPEN','INVESTIGATING','RESOLVED') DEFAULT 'OPEN', admin_note TEXT, resolution ENUM('REFUND_CLIENT','RELEASE_EXPERT','PARTIAL') NULLABLE, resolved_at DATETIME, created_at DATETIME)

16. notifications (id BIGINT PK AUTO_INCREMENT, user_id BIGINT FK->users.id, type VARCHAR(50) NOT NULL, title VARCHAR(255), content TEXT, is_read BOOLEAN DEFAULT FALSE, reference_id BIGINT NULLABLE COMMENT 'contract_id / job_id / etc', created_at DATETIME, INDEX idx_notifications_user(user_id, is_read))

17. audit_logs (id BIGINT PK AUTO_INCREMENT, user_id BIGINT NULLABLE, action VARCHAR(100) NOT NULL, entity_type VARCHAR(50), entity_id BIGINT, details JSON, ip_address VARCHAR(45), created_at DATETIME)

18. refresh_tokens (id BIGINT PK AUTO_INCREMENT, user_id BIGINT FK->users.id ON DELETE CASCADE, token_hash VARCHAR(255) UNIQUE NOT NULL, expires_at DATETIME NOT NULL, revoked BOOLEAN DEFAULT FALSE, created_at DATETIME)

Thêm V2__seed_skills.sql: INSERT 30 skills AI phổ biến (Machine Learning, NLP, Computer Vision, Python, PyTorch, TensorFlow, LangChain, RAG, Fine-tuning, Prompt Engineering, v.v.)

Cấu hình Flyway trong application.yml:
spring.flyway.enabled=true, locations=classpath:db/migration, baseline-on-migrate=true

Thêm dependency flyway-core và flyway-mysql vào pom.xml.
```

---

### TASK-03 · Auth Module — Backend (Register/Login/JWT/Refresh/Logout)

**Mục tiêu:** Implement toàn bộ authentication flow với JWT RS256.

**Prompt:**

```
Bạn là senior Java engineer chuyên Spring Security. Hãy implement Auth Module hoàn chỉnh cho Spring Boot 3.x:

ENTITIES & DTOs:
- Entity: User.java (map bảng users), RefreshToken.java (map bảng refresh_tokens)
- DTO Request: RegisterRequest {email, password, role (CLIENT/EXPERT), fullName}
- DTO Request: LoginRequest {email, password}
- DTO Response: AuthResponse {accessToken, refreshToken, tokenType="Bearer", expiresIn, user {id, email, role, fullName, avatarUrl}}
- DTO Request: RefreshTokenRequest {refreshToken}

SECURITY CONFIG (SecurityConfig.java):
- Dùng SecurityFilterChain bean (không dùng WebSecurityConfigurerAdapter deprecated)
- Permit: POST /api/v1/auth/**, GET /api/v1/jobs, GET /api/v1/services, GET /api/v1/jobs/{id}, GET /api/v1/services/{id}
- Authenticate: tất cả endpoints còn lại
- Thêm JwtAuthenticationFilter trước UsernamePasswordAuthenticationFilter
- CSRF disabled (REST API + JWT)
- SessionManagement: STATELESS
- CORS config: cho phép frontend origin từ application.yml

JWT (JwtTokenProvider.java):
- Dùng thư viện io.jsonwebtoken:jjwt-api:0.12.x
- Access Token: RS256, TTL 15 phút, claims: userId, email, role
- Tạo KeyPair RSA 2048 bit; lưu private/public key vào application.yml (base64 encoded) hoặc đọc từ file
- Method: generateAccessToken(UserDetails), validateToken(token), extractUserId(token), extractRole(token)
- Refresh Token: Random UUID (256-bit), hash bằng SHA-256 trước khi lưu DB

FILTER (JwtAuthenticationFilter.java extends OncePerRequestFilter):
- Extract Bearer token từ Authorization header
- Validate token -> load UserDetailsService -> set SecurityContext
- Bỏ qua các endpoint public

SERVICE (AuthService.java):
- register(): validate email unique, hash password Bcrypt(strength=12), tạo User(status=PENDING), tạo escrow_account, gửi verification email (log ra console ở dev), trả AuthResponse
- login(): authenticate, tạo AccessToken + RefreshToken, lưu refresh token hash vào DB, trả AuthResponse
- refresh(): validate refresh token hash trong DB (không revoked, chưa hết hạn), tạo cặp token mới, revoke token cũ (rotation), trả AuthResponse mới
- logout(): revoke refresh token trong DB, thêm vào Redis blacklist (TTL = thời gian còn lại)
- forgotPassword(): tạo reset token (UUID), lưu cache Redis 15 phút, gửi email
- resetPassword(): validate token từ Redis, cập nhật password_hash mới

CONTROLLER (AuthController.java):
- POST /api/v1/auth/register -> 201 Created
- POST /api/v1/auth/login -> 200 OK
- POST /api/v1/auth/refresh -> 200 OK
- POST /api/v1/auth/logout -> 200 OK (yêu cầu xác thực)
- POST /api/v1/auth/forgot-password -> 200 OK
- POST /api/v1/auth/reset-password -> 200 OK
- GlobalExceptionHandler: xử lý AuthenticationException (401), ValidationException (400), UserAlreadyExistsException (409)

REDIS CONFIG (RedisConfig.java):
- RedisTemplate<String, String> cho blacklist và reset tokens
- Key pattern blacklist: "jwt:blacklist:{tokenHash}", Key pattern reset: "password:reset:{token}"

Viết unit test (JUnit 5 + Mockito) cho AuthService: test register thành công, register email trùng, login sai password, refresh token hết hạn.
```

---

### TASK-04 · Auth Module — Frontend (React)

**Mục tiêu:** Trang Login, Register, quản lý auth state với Zustand.

**Prompt:**

```
Bạn là senior React/TypeScript engineer. Hãy implement Auth Module frontend hoàn chỉnh:

TYPES (src/types/auth.ts):
- Interface User {id, email, role: 'CLIENT'|'EXPERT'|'ADMIN', fullName, avatarUrl}
- Interface AuthResponse {accessToken, refreshToken, tokenType, expiresIn, user: User}
- Interface LoginRequest, RegisterRequest

API LAYER (src/api/authApi.ts):
- Dùng axios instance với baseURL=/api/v1
- Interceptor request: tự động attach Authorization: Bearer {accessToken} từ localStorage
- Interceptor response: nếu 401 -> gọi /auth/refresh tự động, retry request gốc; nếu refresh fail -> clear token, redirect /login
- Hàm: login(data), register(data), logout(), refreshToken(), forgotPassword(email), resetPassword(token, newPassword)

AUTH STORE (src/store/authStore.ts với Zustand):
- State: user, accessToken, refreshToken, isAuthenticated, isLoading
- Actions: login(credentials), register(data), logout(), setTokens(tokens), clearAuth()
- Persist state: lưu tokens vào localStorage, user vào sessionStorage (bảo mật hơn)
- Khởi động app: check localStorage, nếu có token -> gọi /auth/refresh để lấy token mới

TRANG LOGIN (src/pages/auth/LoginPage.tsx):
- Form: email, password với validation (react-hook-form + zod)
- Schema: email valid, password >= 8 ký tự
- Nút "Đăng nhập" với loading state
- Link "Quên mật khẩu", "Chưa có tài khoản? Đăng ký"
- Xử lý lỗi: hiển thị toast thông báo (sonner hoặc react-hot-toast)
- Redirect sau login: CLIENT -> /dashboard/client, EXPERT -> /dashboard/expert, ADMIN -> /admin
- UI: clean, professional với TailwindCSS, responsive mobile-first

TRANG REGISTER (src/pages/auth/RegisterPage.tsx):
- Form: fullName, email, password, confirmPassword, role (CLIENT/EXPERT toggle button)
- Validation: password match, password strength indicator
- Terms & conditions checkbox
- UI tương tự LoginPage

PROTECTED ROUTE (src/components/ProtectedRoute.tsx):
- HOC kiểm tra isAuthenticated; nếu không -> redirect /login với returnUrl
- RoleGuard: kiểm tra role, nếu không đủ quyền -> redirect /403

HOOK (src/hooks/useAuth.ts):
- Wrapper tiện lợi cho authStore
- isClient(), isExpert(), isAdmin() helpers

Viết component theo chuẩn TailwindCSS + shadcn/ui. Đảm bảo responsive.
```

---

## SPRINT 2 — Job Module & Expert Service Listing

---

### TASK-05 · Job Module — Backend CRUD + Search

**Mục tiêu:** API quản lý Job với tìm kiếm, filter, phân trang.

**Prompt:**

```
Implement Job Module cho Spring Boot:

ENTITY (Job.java):
- Map đầy đủ bảng jobs + quan hệ: @ManyToOne client (User), @ManyToMany skills (qua job_skills)
- JobStatus enum: DRAFT, OPEN, IN_PROGRESS, COMPLETED, CANCELLED

DTOs:
- CreateJobRequest: title (NotBlank), description (NotBlank, min 50 chars), budgetMin (Positive), budgetMax (Positive), deadline (FutureOrPresent), skillIds (List<Long>)
- UpdateJobRequest: tương tự, tất cả optional
- JobResponse: id, title, description, budgetMin, budgetMax, deadline, status, aiEnhanced, client {id, fullName, avatarUrl, rating}, skills [], proposalCount, viewCount, createdAt
- JobListResponse: danh sách JobResponse + pagination metadata

REPOSITORY (JobRepository extends JpaRepository):
- Custom query: findJobsWithFilter(@Param skillIds, minBudget, maxBudget, status, keyword, Pageable pageable) dùng @Query JPQL với LEFT JOIN FETCH
- Hỗ trợ full-text search theo title + description: MATCH AGAINST MySQL hoặc LIKE
- findByClientIdOrderByCreatedAtDesc(Long clientId, Pageable pageable)
- countByStatus(JobStatus status)

SERVICE (JobService.java):
- createJob(): validate client role, tạo Job, link skills, ghi audit_log, trả JobResponse
- updateJob(): kiểm tra ownership (client_id == current user hoặc ADMIN), cập nhật
- deleteJob(): chỉ DRAFT/OPEN mới xóa được; nếu có proposal -> báo lỗi
- getJob(id): tăng view_count (async, @Async), trả JobResponse
- listJobs(filter): phân trang, filter theo skill/budget/status/keyword
- listMyJobs(clientId): danh sách job của client hiện tại
- publishJob(id): chuyển DRAFT -> OPEN, validate đủ thông tin

CONTROLLER (JobController.java):
- GET /api/v1/jobs?page=0&size=10&skills=1,2&minBudget=100&maxBudget=5000&status=OPEN&keyword=nlp
- POST /api/v1/jobs [CLIENT only] -> 201
- GET /api/v1/jobs/{id} -> 200
- PUT /api/v1/jobs/{id} [CLIENT owner / ADMIN] -> 200
- DELETE /api/v1/jobs/{id} [CLIENT owner / ADMIN] -> 204
- POST /api/v1/jobs/{id}/publish [CLIENT owner] -> 200
- GET /api/v1/jobs/{id}/proposals [CLIENT owner] -> 200
- GET /api/v1/jobs/my [CLIENT] -> 200 (danh sách job của mình)

VALIDATION & ERROR HANDLING:
- @PreAuthorize("hasRole('CLIENT')") cho create/update/delete
- ResourceNotFoundException (404) khi không tìm thấy job
- ForbiddenException (403) khi không phải owner
- budgetMax phải >= budgetMin: custom @BudgetRange validator

INDEX MySQL: thêm V3__add_indexes.sql: INDEX idx_jobs_status, idx_jobs_client_id, FULLTEXT idx_jobs_search(title, description)

Test: JobServiceTest với MockMvc, test CRUD, test filter, test phân quyền.
```

---

### TASK-06 · Expert Service Listing — Backend

**Mục tiêu:** API quản lý Service của Expert (marketplace).

**Prompt:**

```
Implement Expert Service Module cho Spring Boot:

ENTITY (Service.java — đặt tên ExpertService để tránh xung đột với Spring):
- Map bảng services, @ManyToOne expert (User), tags lưu dưới dạng JSON (dùng @Convert với JsonConverter)
- ServiceStatus enum: ACTIVE, INACTIVE, PENDING_REVIEW

DTOs:
- CreateServiceRequest: title, description (min 100 chars), price (Positive, max 99999.99), deliveryDays (1-365), tags (List<String> max 10), skillIds
- ServiceResponse: id, title, description, price, deliveryDays, status, tags, rating, orderCount, expert {id, fullName, avatarUrl, rating, totalReviews}, skills[], createdAt
- ServiceFilterRequest: keyword, minPrice, maxPrice, maxDeliveryDays, skillIds, minRating, sortBy (PRICE_ASC/DESC, RATING, NEWEST)

REPOSITORY (ExpertServiceRepository):
- findServicesWithFilter: JPQL query với filter động, hỗ trợ sort
- findByExpertIdAndStatus(Long expertId, ServiceStatus status, Pageable pageable)
- findTopRatedServices(Pageable pageable): ORDER BY rating DESC, order_count DESC

SERVICE (ExpertServiceService.java):
- createService(): validate EXPERT role, tạo service với status=PENDING_REVIEW
- updateService(): kiểm tra ownership, chỉ update khi INACTIVE hoặc PENDING_REVIEW
- activateService(): ADMIN approve -> ACTIVE
- deactivateService(): EXPERT tự ẩn -> INACTIVE
- browseMarketplace(filter): phân trang, có thể dùng anonymous (không cần auth)
- getServiceDetail(id): trả ServiceResponse đầy đủ
- getMyServices(expertId): danh sách dịch vụ của expert

CONTROLLER (ServiceController.java):
- GET /api/v1/services (public) - marketplace browse
- POST /api/v1/services [EXPERT]
- GET /api/v1/services/{id} (public)
- PUT /api/v1/services/{id} [EXPERT owner]
- DELETE /api/v1/services/{id} [EXPERT owner / ADMIN]
- GET /api/v1/services/my [EXPERT]
- POST /api/v1/services/{id}/activate [ADMIN]
- POST /api/v1/services/{id}/deactivate [EXPERT owner]

Đảm bảo mapper Service entity <-> DTO dùng MapStruct.
```

---

### TASK-07 · Job & Marketplace UI — Frontend

**Mục tiêu:** Trang danh sách Job, chi tiết Job, tạo/sửa Job, Marketplace dịch vụ.

**Prompt:**

```
Implement Job và Marketplace UI với React + TypeScript + TailwindCSS:

API HOOKS (src/api/jobApi.ts, serviceApi.ts):
- Dùng @tanstack/react-query cho tất cả API calls
- jobApi: getJobs(filter, page), getJob(id), createJob(data), updateJob(id,data), deleteJob(id), publishJob(id), getMyJobs()
- serviceApi: getServices(filter), getService(id), createService(data), updateService(id,data), getMyServices()
- Custom hook useJobs(filter), useJob(id), useCreateJob(), useUpdateJob()

TRANG MARKETPLACE (src/pages/marketplace/MarketplacePage.tsx):
- Layout 2 cột: sidebar filter + danh sách dịch vụ
- Filter sidebar: price range (slider), delivery days, skills (checkbox), min rating (stars)
- Danh sách: ServiceCard component (avatar expert, title, price, rating, delivery days, tags)
- Search bar với debounce 300ms
- Sort dropdown: Phổ biến nhất, Giá thấp nhất, Đánh giá cao nhất, Mới nhất
- Infinite scroll hoặc pagination
- Loading skeleton khi fetch

TRANG JOB LISTING (src/pages/jobs/JobsPage.tsx):
- Tương tự Marketplace nhưng cho Jobs
- JobCard: title, budget range, deadline, skills tags, proposal count, client info
- Filter: budget, skills, status (chỉ OPEN)

TRANG CHI TIẾT JOB (src/pages/jobs/JobDetailPage.tsx):
- Full job info, client profile card, skills required
- Section "Chuyên gia gợi ý" (placeholder cho AI recommendation Sprint 5)
- Button "Gửi Đề Xuất" (EXPERT) / "Sửa Job" (CLIENT owner)
- Danh sách proposals (chỉ client owner thấy)

FORM TẠO/SỬA JOB (src/pages/jobs/JobFormPage.tsx):
- Multi-step form (3 bước): 1) Thông tin cơ bản, 2) Budget & Deadline, 3) Skills & Review
- Step 1: title (rich text hoặc textarea), description (markdown editor nhỏ)
- Step 2: budget range slider + input, date picker deadline
- Step 3: skill selector (search + multi-select tags), preview, submit
- Button "AI Enhance" nổi bật (sẽ gọi API Sprint 5)
- Validation real-time với react-hook-form + zod
- Draft auto-save vào localStorage mỗi 30s

USER PROFILE (src/pages/profile/UserProfilePage.tsx):
- Avatar upload (preview trước khi submit)
- Form thông tin: fullName, bio, hourlyRate, portfolioUrl
- Skills section: thêm/xóa skills
- Stats: rating, totalReviews, completionRate (readonly)

Tất cả components phải responsive, dùng TailwindCSS + shadcn/ui.
```

---

## SPRINT 3 — Proposal, Contract, Milestone, Escrow Mock

---

### TASK-08 · Proposal & Contract — Backend

**Mục tiêu:** Luồng gửi đề xuất, tạo hợp đồng, quản lý milestone.

**Prompt:**

```
Implement Proposal → Contract → Milestone flow:

ENTITIES: Proposal.java, Contract.java, Milestone.java (map theo schema đã tạo)

DTOs:
- CreateProposalRequest: jobId, price (Positive), timelineDays (1-365), coverLetter (min 50 chars)
- ProposalResponse: id, job{id,title}, expert{id,fullName,avatarUrl,rating}, price, timelineDays, coverLetter, status, createdAt
- CreateContractRequest: proposalId, milestones (List<MilestoneInput {name, description, amount, dueDate, orderIndex}>)
- ContractResponse: id, job, proposal, client, expert, totalAmount, status, milestones[], createdAt
- MilestoneUpdateRequest: status (SUBMITTED), deliverableUrl, deliverableNote

SERVICE (ProposalService.java):
- submitProposal(): validate EXPERT role, job phải OPEN, expert chưa gửi proposal cho job này (unique check), tạo Proposal
- withdrawProposal(): chỉ PENDING mới withdraw được
- listProposalsForJob(jobId): chỉ client owner mới xem được, kèm expert profile

SERVICE (ContractService.java, @Transactional):
- createContract(proposalId, milestones):
  1. Validate: chỉ CLIENT, proposal phải PENDING, job phải OPEN
  2. Tạo Contract với status=ACTIVE
  3. Cập nhật proposal.status = ACCEPTED, các proposal khác của job = REJECTED
  4. Cập nhật job.status = IN_PROGRESS
  5. Gọi EscrowService.lockFunds(clientId, contract.totalAmount)
  6. Tạo tất cả milestones
  7. Gửi notification cho expert
- getContract(id): validate người dùng là client hoặc expert của contract
- submitMilestone(contractId, milestoneId, deliverableUrl, note): EXPERT upload deliverable, đổi status -> SUBMITTED
- approveMilestone(contractId, milestoneId): 
  1. Validate: CLIENT, milestone phải SUBMITTED
  2. Đổi milestone.status = APPROVED
  3. Gọi EscrowService.releaseFunds(contractId, milestoneId) -> chuyển tiền cho expert (trừ 10% phí)
  4. Log FEE transaction
  5. Nếu tất cả milestones APPROVED -> Contract.status = COMPLETED, cập nhật job status, update expert completion_rate
- rejectMilestone(contractId, milestoneId, reason): EXPERT phải sửa lại

SERVICE (EscrowService.java, @Transactional):
- lockFunds(userId, amount): validate balance >= amount, tạo ESCROW_LOCK transaction, cập nhật escrow_accounts.locked_amount
- releaseFunds(contractId, milestoneId): tính expert amount (90%), fee (10%), tạo RELEASE + FEE transactions, cập nhật balance của expert
- refundFunds(contractId): Admin dispute resolution, hoàn tiền về client

CONTROLLER:
- POST /api/v1/proposals [EXPERT]
- DELETE /api/v1/proposals/{id} (withdraw) [EXPERT owner]
- GET /api/v1/jobs/{jobId}/proposals [CLIENT owner]
- POST /api/v1/contracts [CLIENT]
- GET /api/v1/contracts/{id} [CLIENT hoặc EXPERT của contract]
- GET /api/v1/contracts/my [CLIENT/EXPERT - danh sách contract của mình]
- POST /api/v1/contracts/{id}/milestones [CLIENT]
- PUT /api/v1/contracts/{id}/milestones/{mId} [EXPERT - submit deliverable]
- POST /api/v1/contracts/{id}/milestones/{mId}/approve [CLIENT]
- POST /api/v1/contracts/{id}/milestones/{mId}/reject [CLIENT]
- POST /api/v1/contracts/{id}/dispute [CLIENT hoặc EXPERT]

Unit tests: EscrowServiceTest với @DataJpaTest, test lock/release/refund với @Transactional rollback scenarios.
```

---

### TASK-09 · Contract & Milestone UI — Frontend

**Mục tiêu:** Trang quản lý project, milestone tracking, submit deliverable.

**Prompt:**

```
Implement Contract và Project Management UI:

TRANG DANH SÁCH PROPOSALS (src/pages/proposals/ProposalListPage.tsx — chỉ CLIENT):
- Hiện cho từng job, layout card expert
- Mỗi ProposalCard: avatar, tên, rating, price chào, timeline, cover letter (truncated), nút "Xem đầy đủ", "Chấp nhận"
- Modal "Chấp nhận Proposal": form nhập milestones (dynamic form, có thể add/remove milestone), tổng tiền, confirm

FORM GỬI PROPOSAL (src/pages/proposals/ProposalFormPage.tsx — chỉ EXPERT):
- Form: price, timelineDays, coverLetter (textarea với word count)
- Preview job info bên cạnh
- Validation: price không được âm, coverLetter >= 50 ký tự

TRANG CHI TIẾT CONTRACT (src/pages/contracts/ContractDetailPage.tsx):
- Header: thông tin contract, total amount, status badge, ngày tạo
- Timeline milestones:
  - Mỗi milestone: tên, số tiền, deadline, status badge (color coded), action button
  - EXPERT thấy: "Upload Deliverable" (khi PENDING/IN_PROGRESS), link xem deliverable (khi SUBMITTED/APPROVED)
  - CLIENT thấy: "Duyệt" / "Từ chối" (khi SUBMITTED)
- Upload Deliverable Modal: input URL hoặc file upload lên S3 (pre-signed URL)
- Reject Modal: textarea lý do từ chối
- Progress bar: X/Y milestones đã hoàn thành
- Chat widget (placeholder, kết nối Sprint 4)
- Button "Mở Tranh Chấp" (khi có vấn đề)

TRANG DASHBOARD CLIENT (src/pages/dashboard/ClientDashboard.tsx):
- Stats cards: Active Projects, Pending Approvals, Total Spent, Jobs Posted
- Danh sách Active Contracts (top 5)
- My Jobs với status
- Quick actions: Post New Job, Check Proposals

TRANG DASHBOARD EXPERT (src/pages/dashboard/ExpertDashboard.tsx):
- Stats: Active Projects, Earnings This Month, Pending Proposals, Rating
- Earnings chart (recharts BarChart): thu nhập 6 tháng gần nhất
- Active milestones cần submit
- Open Jobs phù hợp (placeholder)
```

---

## SPRINT 4 — Payment, WebSocket Chat, Notifications

---

### TASK-10 · Payment Integration — Backend (Stripe/Mock)

**Mục tiêu:** Tích hợp thanh toán, webhook, deposit, withdraw.

**Prompt:**

```
Implement Payment Module cho Spring Boot:

STRIPE INTEGRATION (hoặc mock nếu chưa có account):
- Dependency: com.stripe:stripe-java:24.x
- StripeConfig.java: @Value("${stripe.secret-key}") String secretKey, khởi tạo Stripe.apiKey

SERVICE (PaymentService.java):
- createDepositSession(userId, amount, currency):
  1. Tạo Stripe Checkout Session (mode=PAYMENT, payment_method_types=[card])
  2. success_url và cancel_url redirect về frontend
  3. metadata: {userId, amount, currency}
  4. Tạo Transaction(PENDING) trong DB với ref_code = session.id
  5. Trả về {sessionId, checkoutUrl}
  
- handleWebhook(payload, sigHeader):
  1. Verify Stripe webhook signature (Webhook.constructEvent)
  2. Xử lý event checkout.session.completed:
     - Tìm Transaction theo ref_code
     - Cập nhật status = SUCCESS
     - Cộng balance vào EscrowAccount
     - Gửi notification "Nạp tiền thành công"
  3. Xử lý event payment_intent.payment_failed: Transaction.status = FAILED
  
- createWithdrawRequest(expertId, amount, bankInfo):
  1. Validate: balance - lockedAmount >= amount, amount >= threshold (50 USD)
  2. Tạo Transaction(WITHDRAW, PENDING)
  3. Gửi notification cho Admin
  4. (Manual process hoặc Stripe Payout trong môi trường prod)

- getTransactionHistory(userId, Pageable): phân trang, filter theo type
- getBalance(userId): trả {balance, lockedAmount, availableBalance = balance - lockedAmount}

CONTROLLER (PaymentController.java):
- POST /api/v1/payments/deposit -> 200 {sessionId, checkoutUrl}
- POST /api/v1/payments/webhook (PUBLIC, không auth) -> 200
- POST /api/v1/payments/withdraw [EXPERT]
- GET /api/v1/payments/transactions -> phân trang
- GET /api/v1/payments/balance

MOCK MODE: application-dev.yml: stripe.mock=true
- Khi mock=true: MockPaymentService tự động approve deposit sau 2 giây (Scheduled), không cần Stripe

Bảo mật webhook: validate Stripe-Signature header, throw exception nếu invalid.
```

---

### TASK-11 · Real-time Chat — Backend (WebSocket STOMP)

**Mục tiêu:** Hệ thống chat real-time theo contract room.

**Prompt:**

```
Implement WebSocket Chat và Notification System:

WEBSOCKET CONFIG (WebSocketConfig.java):
- @EnableWebSocketMessageBroker
- configureMessageBroker: enableSimpleBroker("/topic"), setApplicationDestinationPrefixes("/app")
- registerStompEndpoints: addEndpoint("/ws"), withSockJS()
- WebSocket security: configureClientInboundChannel -> thêm ChannelInterceptor xác thực JWT từ CONNECT frame header

JWT WEBSOCKET AUTH (WebSocketAuthInterceptor.java implements ChannelInterceptor):
- Trong preSend(): nếu CONNECT command -> extract JWT từ nativeHeaders["Authorization"]
- Validate JWT, load user, set Authentication vào accessor
- Nếu JWT invalid -> throw MessageDeliveryException

ENTITY & DTO:
- Message.java (map bảng messages)
- ChatMessageRequest: contractId (Long), content (String, NotBlank, max 2000 chars)
- ChatMessageResponse: id, contractId, sender{id,fullName,avatarUrl}, content, createdAt, isRead
- TypingEvent: contractId, userId, typing (boolean)

SERVICE (ChatService.java):
- sendMessage(senderId, contractId, content):
  1. Validate: sender phải là client hoặc expert của contract
  2. Lưu Message vào MySQL
  3. Convert sang ChatMessageResponse
  4. Broadcast qua /topic/chat/{contractId}
  5. Nếu recipient đang offline -> tạo Notification trong DB
- getMessageHistory(contractId, Pageable): phân trang, 50 tin/trang, DESC
- markMessagesRead(contractId, userId): UPDATE messages SET is_read=true WHERE contract_id=? AND sender_id!=?

CONTROLLER (ChatController.java @Controller):
- @MessageMapping("/chat.send") -> xử lý gửi tin, @SendTo("/topic/chat/{contractId}")
- @MessageMapping("/chat.typing") -> broadcast typing event
- REST endpoint: GET /api/v1/messages/{contractId}?page=0 (lịch sử chat)
- REST endpoint: POST /api/v1/messages/{contractId}/read (đánh dấu đã đọc)

NOTIFICATION SERVICE (NotificationService.java):
- createNotification(userId, type, title, content, referenceId): lưu DB + push qua /topic/notifications/{userId}
- Các loại notification: NEW_PROPOSAL, CONTRACT_CREATED, MILESTONE_SUBMITTED, MILESTONE_APPROVED, MILESTONE_REJECTED, PAYMENT_RECEIVED, DISPUTE_OPENED, MESSAGE_RECEIVED
- getNotifications(userId, Pageable): danh sách chưa đọc trước
- markRead(notificationId, userId): đánh dấu đã đọc
- markAllRead(userId)

REST: GET /api/v1/notifications, POST /api/v1/notifications/{id}/read, POST /api/v1/notifications/read-all

REDIS PUB/SUB (để scale WebSocket qua nhiều instance):
- RedisMessageListenerContainer config
- Khi có tin nhắn mới: publish vào Redis channel "chat:{contractId}"
- Các instance khác subscribe và broadcast qua STOMP broker
```

---

### TASK-12 · Chat & Notification UI — Frontend

**Mục tiêu:** Chat widget real-time, notification bell, notification list.

**Prompt:**

```
Implement Chat và Notification UI:

WEBSOCKET HOOK (src/hooks/useWebSocket.ts):
- Dùng @stomp/stompjs + sockjs-client
- connect(accessToken): kết nối /ws, gửi JWT trong connect headers
- subscribe(topic, callback): trả về unsubscribe function
- sendMessage(destination, body): publish STOMP message
- Reconnect tự động với exponential backoff (500ms, 1s, 2s, ... max 30s)
- onConnect, onDisconnect, onError callbacks

CHAT HOOKS (src/hooks/useChat.ts):
- State: messages[], isLoading, isConnected, typingUsers
- useEffect: connect WebSocket, subscribe /topic/chat/{contractId}, load lịch sử
- sendMessage(content): gửi qua STOMP + optimistic update
- loadMore(): fetch trang trước (infinite scroll lên trên)
- Cleanup khi unmount

CHAT WIDGET (src/components/chat/ChatWidget.tsx):
- Layout: fixed bottom-right hoặc inline trong ContractDetail
- MessageBubble: avatar, tên, nội dung, thời gian, status (sent/read)
- Tin của mình: bubble bên phải (màu primary)
- Tin của người kia: bubble bên trái (màu neutral)
- "Đang nhập..." indicator với animation
- Input: textarea (Enter gửi, Shift+Enter xuống dòng), nút attach file (placeholder)
- Scroll to bottom tự động khi có tin mới
- Hiển thị thời gian theo nhóm (Hôm nay, Hôm qua, ngày cụ thể)
- Đánh dấu đã đọc khi component visible (IntersectionObserver)

NOTIFICATION COMPONENT (src/components/notifications/NotificationBell.tsx):
- Icon chuông với badge số chưa đọc (đỏ, max 99+)
- Dropdown: danh sách 10 notification gần nhất
- Mỗi NotificationItem: icon theo loại, title, content, thời gian tương đối, dot chưa đọc
- Nút "Đánh dấu tất cả đã đọc"
- Link "Xem tất cả" -> /notifications
- Subscribe /topic/notifications/{userId} qua WebSocket -> cập nhật real-time

NOTIFICATION HOOK (src/hooks/useNotifications.ts):
- Load initial từ API
- Subscribe WebSocket cho notifications mới
- Optimistic mark-read
- unreadCount computed

TRANG LỊCH SỬ GIAO DỊCH (src/pages/wallet/TransactionPage.tsx):
- Balance card: Available, Locked, Total Deposited
- Nút "Nạp tiền" -> redirect Stripe Checkout
- Table transactions: loại, số tiền, trạng thái, thời gian, mã tham chiếu
- Filter theo type, date range
- Pagination
```

---

## SPRINT 5 — AI Modules

---

### TASK-13 · AI Modules — Backend (Job Assistant, Service Generator, Expert Recommendation)

**Mục tiêu:** Tích hợp 3 module AI với Anthropic/OpenAI API.

**Prompt:**

```
Implement 3 AI Modules cho Spring Boot:

DEPENDENCY: com.fasterxml.jackson.core:jackson-databind (đã có), thêm OkHttpClient hoặc dùng RestTemplate/WebClient để gọi API

AI CONFIG (AIConfig.java):
- @Value anthropic.api-key, openai.api-key, ai.provider (ANTHROPIC/OPENAI)
- Tạo bean AIClient tương ứng

BASE AI CLIENT (AIClient interface):
- String complete(String systemPrompt, String userMessage, int maxTokens)
- Implement AnthropicClient: gọi https://api.anthropic.com/v1/messages với header x-api-key, content-type, anthropic-version
- Implement OpenAIClient: gọi https://api.openai.com/v1/chat/completions

MODULE 1 — AI JOB ASSISTANT (AIJobAssistantService.java):
DTO Input: AIJobRequest {title, description, budgetMin, budgetMax, skills[]}
DTO Output: AIJobSuggestionDTO {improvedTitle, improvedDescription, suggestedBudgetMin, suggestedBudgetMax, missingSkills[], reasoning}

System prompt:
"You are an AI job assistant for an AI freelance marketplace. Analyze the job draft and return ONLY valid JSON (no markdown, no explanation) with this exact structure:
{
  \"improvedTitle\": \"...\",
  \"improvedDescription\": \"...\",
  \"suggestedBudgetMin\": number,
  \"suggestedBudgetMax\": number,
  \"missingSkills\": [\"skill1\", \"skill2\"],
  \"reasoning\": \"brief explanation\"
}"

Logic:
- Parse JSON response từ LLM
- Ghi log vào bảng ai_usage_logs (tạo bảng mới: user_id, module, tokens_used, cost_usd, created_at)
- Cache trong Redis 5 phút với key "ai:job:{hash(jobContent)}"
- Cập nhật jobs.ai_enhanced = true

MODULE 2 — AI SERVICE GENERATOR (AIServiceGeneratorService.java):
DTO Input: ServiceGenerateRequest {serviceTitle, keywords[], deliveryDays, price}
DTO Output: ServiceGeneratedDTO {description, highlights[], whatYouGet[]}

System prompt:
"Generate a professional AI service description for a freelance marketplace. Return ONLY valid JSON:
{
  \"description\": \"300 word professional description\",
  \"highlights\": [\"highlight1\", \"highlight2\", \"highlight3\"],
  \"whatYouGet\": [\"deliverable1\", \"deliverable2\", \"deliverable3\"]
}"

MODULE 3 — AI EXPERT RECOMMENDATION (AIRecommendationService.java):
Thuật toán embedding-based:
- Khi Expert cập nhật profile/skills -> gọi embedding API (text-embedding-3-small hoặc text-embedding-ada-002) với text = skills.join(", ") + " " + bio
- Lưu embedding (List<Float> 1536 dims) vào user_profiles.skills_embedding (JSON column)
- updateExpertEmbedding(userId): gọi async @Async @EventListener(ProfileUpdatedEvent.class)

RecommendationService.getTopExperts(jobId, topN=5):
1. Load job description + skills
2. Tạo embedding cho job description
3. Tính cosine similarity với tất cả expert embeddings trong memory (hoặc batch từ DB)
4. Filter: rating >= 3.5, is_available = true (bỏ điều kiện quá strict lúc dev)
5. Sort theo similarity score DESC
6. Cache Redis 10 phút key "rec:job:{jobId}"
7. Trả List<ExpertRecommendationDTO {expertId, fullName, avatarUrl, rating, skills[], similarityScore}>

UTIL (CosineSimilarityUtil.java):
- float cosineSimilarity(List<Float> a, List<Float> b)

CONTROLLER:
- POST /api/v1/jobs/{id}/ai-enhance [CLIENT owner] -> AIJobSuggestionDTO
- POST /api/v1/services/ai-generate [EXPERT] -> ServiceGeneratedDTO
- GET /api/v1/services/recommend/{jobId} (public) -> List<ExpertRecommendationDTO>

RATE LIMITING (Bucket4j hoặc @RateLimiter):
- AI endpoints: max 10 calls/user/hour để kiểm soát chi phí
- Header X-RateLimit-Remaining trong response

FALLBACK: Nếu AI API down -> trả empty suggestion với error message, không throw 500.
```

---

### TASK-14 · AI Modules UI — Frontend

**Mục tiêu:** Tích hợp 3 AI module vào luồng người dùng.

**Prompt:**

```
Implement AI Module UI cho React:

AI JOB ASSISTANT (tích hợp vào JobFormPage.tsx):
- "AI Enhance" button nổi bật (gradient, icon sparkles): xuất hiện sau khi điền đủ title + description
- Loading state: animation "AI đang phân tích..." (skeleton shimmer)
- AIJobSuggestionPanel.tsx component:
  - Layout 2 cột: "Hiện tại" vs "AI gợi ý"
  - Mỗi field (title, description, budget): diff view, text màu xanh = đề xuất mới
  - Checkbox per field: "Áp dụng gợi ý này"
  - MissingSkills: list tags có thể click để add
  - Reasoning section: collapse/expand
  - Nút "Áp dụng tất cả" và "Bỏ qua"
  - Sau khi áp dụng: form tự động điền với giá trị AI đề xuất

AI SERVICE GENERATOR (tích hợp vào ServiceFormPage.tsx):
- Bước mới trong form: nhập keywords[] (tag input) + chọn giá, ngày giao hàng
- Button "Tạo mô tả với AI"
- Hiển thị kết quả: description (editable textarea), highlights (list), whatYouGet (list)
- User có thể edit từng phần trước khi submit
- "Regenerate" nếu không ưng

AI EXPERT RECOMMENDATION (trong JobDetailPage.tsx):
- Section "Chuyên gia phù hợp" dưới job description
- Grid 2-3 expert cards, mỗi card:
  - Avatar, tên, rating (stars), skills tags
  - Similarity badge: "93% phù hợp" (màu gradient)
  - Button "Xem Profile" / "Mời Chuyên Gia"
- Skeleton loading khi fetch
- Nếu không có recommendations: "Chưa có chuyên gia phù hợp"

HOOKS:
- useAIJobEnhance(): mutation hook, loading/error/data states
- useAIServiceGenerate(): mutation hook
- useExpertRecommendations(jobId): query hook với staleTime 10 phút

Error handling: nếu AI call fail -> toast "AI tạm thời không khả dụng, vui lòng thử lại sau" (không block form)
```

---

## SPRINT 6 — Dispute, Reviews, Withdraw, Admin

---

### TASK-15 · Dispute, Review, Withdraw — Backend

**Mục tiêu:** Xử lý tranh chấp, đánh giá, và rút tiền.

**Prompt:**

```
Implement Dispute, Review và Withdraw modules:

DISPUTE SERVICE (DisputeService.java):
- openDispute(contractId, openedBy, reason):
  1. Validate: contract phải ACTIVE, chưa có dispute OPEN/INVESTIGATING cho contract này
  2. Tạo Dispute(OPEN), cập nhật Contract.status = DISPUTED
  3. Notify Admin qua /topic/notifications/admin
- getDispute(id): ADMIN hoặc các bên liên quan
- resolveDispute(disputeId, resolution, adminNote) [ADMIN only]:
  - REFUND_CLIENT: gọi EscrowService.refundAllLocked(contractId)
  - RELEASE_EXPERT: gọi EscrowService.releaseAllPending(contractId)
  - PARTIAL: admin nhập % cho mỗi bên
  - Cập nhật dispute.status = RESOLVED, contract.status = (CANCELLED hoặc COMPLETED)
  - Notify cả 2 bên

REVIEW SERVICE (ReviewService.java):
- createReview(contractId, reviewerId, rating, comment):
  1. Validate: contract phải COMPLETED, reviewer phải là client hoặc expert của contract, chưa review (UNIQUE constraint)
  2. Tạo Review
  3. Cập nhật user_profiles.rating = AVG(reviews WHERE reviewee_id=?), total_reviews++
  4. Cập nhật expert completion_rate nếu reviewer là client
- getReviewsForUser(userId, Pageable): danh sách reviews nhận được

WITHDRAW SERVICE (WithdrawService.java):
- requestWithdraw(expertId, amount, bankName, accountNumber, accountHolder):
  1. Validate: available balance >= amount, amount >= min threshold (50 USD)
  2. Deduct balance, tạo Transaction(WITHDRAW, PENDING)
  3. Lưu bank info (tạm thời, production cần mã hóa)
  4. Notify Admin
- approveWithdraw(transactionId) [ADMIN]: Transaction.status = SUCCESS, ghi audit log
- rejectWithdraw(transactionId, reason) [ADMIN]: hoàn balance, Transaction.status = FAILED

CONTROLLER:
- POST /api/v1/contracts/{id}/dispute [CLIENT/EXPERT]
- GET /api/v1/disputes [ADMIN]
- GET /api/v1/disputes/{id}
- POST /api/v1/disputes/{id}/resolve [ADMIN]
- POST /api/v1/contracts/{id}/review [CLIENT/EXPERT]
- GET /api/v1/users/{id}/reviews
- POST /api/v1/payments/withdraw [EXPERT]
- GET /api/v1/admin/withdrawals [ADMIN]
- POST /api/v1/admin/withdrawals/{id}/approve [ADMIN]
- POST /api/v1/admin/withdrawals/{id}/reject [ADMIN]
```

---

### TASK-16 · Admin Dashboard — Backend

**Mục tiêu:** API cho Admin panel: analytics, user management, moderation.

**Prompt:**

```
Implement Admin Module:

ADMIN SERVICE (AdminService.java) — tất cả method @PreAuthorize("hasRole('ADMIN')"):

User Management:
- listUsers(role, status, keyword, Pageable): filter + search
- getUserDetail(userId): thông tin đầy đủ + lịch sử hoạt động
- updateUserStatus(userId, status): ACTIVE/SUSPENDED/PENDING
- deleteUser(userId): soft delete (status = DELETED)

Content Moderation:
- listPendingServices(): services chờ duyệt (PENDING_REVIEW)
- approveService(serviceId): ACTIVE
- rejectService(serviceId, reason): INACTIVE + notify expert
- flagJob(jobId, reason): set job.status = CANCELLED

Analytics Service (AnalyticsService.java):
- getDashboardStats(): {totalUsers, totalJobs, totalContracts, totalRevenue(platform fees), activeContracts, newUsersThisWeek, newJobsThisWeek}
- getRevenueChart(period: WEEK/MONTH/YEAR): List<{date, revenue, transactionCount}>
  - Query: SELECT DATE(created_at), SUM(amount), COUNT(*) FROM transactions WHERE type='FEE' GROUP BY DATE
- getTopExperts(limit): ORDER BY rating DESC, completion_rate DESC
- getJobSuccessRate(): COMPLETED contracts / total contracts
- getUserGrowth(months): user đăng ký theo tháng

CONTROLLER (AdminController.java):
- GET /api/v1/admin/stats
- GET /api/v1/admin/revenue-chart?period=MONTH
- GET /api/v1/admin/users?role=EXPERT&status=ACTIVE
- PUT /api/v1/admin/users/{id}/status
- GET /api/v1/admin/services/pending
- POST /api/v1/admin/services/{id}/approve
- POST /api/v1/admin/services/{id}/reject
- GET /api/v1/admin/disputes (danh sách dispute cần xử lý)
- GET /api/v1/admin/withdrawals (danh sách rút tiền chờ duyệt)

Thêm Swagger @Tag("Admin") cho tất cả admin endpoints. Chỉ truy cập khi có role ADMIN.
```

---

### TASK-17 · Admin Dashboard UI — Frontend

**Mục tiêu:** Giao diện Admin panel đầy đủ.

**Prompt:**

```
Implement Admin Panel UI:

LAYOUT (src/pages/admin/AdminLayout.tsx):
- Sidebar navigation: Dashboard, Users, Jobs, Services, Disputes, Withdrawals, Analytics
- Protected route: chỉ ADMIN role
- Breadcrumb

DASHBOARD (src/pages/admin/AdminDashboardPage.tsx):
- Stats cards (recharts hay inline): Total Users, Active Jobs, Total Revenue, Pending Disputes
- Revenue Line Chart (recharts): 12 tháng gần nhất, format tiền tệ trục Y
- Recent Disputes table: contractId, parties, reason, status, action
- Pending Service Approvals: list với Approve/Reject nút

USER MANAGEMENT (src/pages/admin/UsersPage.tsx):
- DataTable với sorting, filter theo role/status, search
- Actions per row: View, Suspend, Activate, Delete
- UserDetailModal: thông tin đầy đủ, lịch sử hoạt động (timeline)

SERVICE MODERATION (src/pages/admin/ServiceModerationPage.tsx):
- Tabs: Pending | Active | Rejected
- ServiceModerationCard: preview dịch vụ, expert info, nút Approve/Reject
- Reject modal: textarea lý do

DISPUTE MANAGEMENT (src/pages/admin/DisputePage.tsx):
- Danh sách disputes
- DisputeDetailPage: thông tin contract, timeline milestones, lịch sử thanh toán escrow, textarea admin note, radio resolution (Refund/Release/Partial), % slider nếu Partial

WITHDRAWAL MANAGEMENT (src/pages/admin/WithdrawalPage.tsx):
- Table: expert, số tiền, ngân hàng, thời gian yêu cầu
- Approve/Reject với confirmation modal

Dùng recharts cho charts, shadcn/ui DataTable component, toast cho actions.
```

---

## SPRINT 7 — Performance, Security, AWS Deploy

---

### TASK-18 · Performance Tuning & Caching

**Mục tiêu:** Tối ưu hóa tốc độ, thêm cache layer.

**Prompt:**

```
Implement caching và performance optimization:

SPRING CACHE CONFIG (CacheConfig.java):
- @EnableCaching, dùng Redis làm cache store
- RedisCacheManager với default TTL 5 phút, custom TTL per cache name
- Cache names và TTL:
  - "jobs": 2 phút (dữ liệu thay đổi thường xuyên)
  - "services": 5 phút
  - "expert-recommendations": 10 phút
  - "user-profiles": 10 phút
  - "skill-list": 60 phút (ít thay đổi)

CACHE ANNOTATIONS:
- JobService.getJob(id): @Cacheable("jobs") với key="#id"
- JobService.listJobs(): @Cacheable("jobs") với key="#filter.hashCode()"
- ExpertServiceService.browseMarketplace(): @Cacheable("services")
- UserService.getUserProfile(id): @Cacheable("user-profiles")
- Cache evict: @CacheEvict("jobs") khi createJob/updateJob/deleteJob
- @CacheEvict("user-profiles") khi updateProfile

DATABASE OPTIMIZATION (V4__add_performance_indexes.sql):
- INDEX idx_jobs_status_created (status, created_at DESC)
- INDEX idx_proposals_job_expert (job_id, expert_id)
- INDEX idx_contracts_client (client_id, status)
- INDEX idx_contracts_expert (expert_id, status)
- INDEX idx_transactions_user_created (user_id, created_at DESC)
- INDEX idx_messages_contract_created (contract_id, created_at DESC)
- INDEX idx_notifications_user_read (user_id, is_read)
- FULLTEXT INDEX idx_services_search (title, description) ON services

N+1 QUERY FIX:
- Kiểm tra tất cả repository queries có @EntityGraph hoặc JOIN FETCH để tránh N+1
- JobRepository.findByIdWithSkills(): @EntityGraph(attributePaths={"skills","client","client.profile"})
- ContractRepository.findByIdWithDetails(): fetch contract + milestones + client + expert

ASYNC PROCESSING (@Async):
- view_count increment: @Async void incrementViewCount(Long jobId)
- AI embedding update: @Async void updateExpertEmbedding(Long userId)
- Email/notification gửi: @Async void sendEmailNotification(...)
- Config ThreadPoolTaskExecutor: corePoolSize=5, maxPoolSize=20, queueCapacity=100

PAGINATION OPTIMIZATION:
- Tất cả list API dùng Slice thay vì Page khi không cần total count (vô hạn scroll)
- Dùng keyset pagination (WHERE id < lastId ORDER BY id DESC LIMIT 20) cho messages

ACTUATOR + METRICS:
- spring-boot-starter-actuator endpoint /actuator/health, /actuator/metrics
- Expose metrics cho CloudWatch Agent
- Custom metric: counter "ai.api.calls", timer "api.response.time"
```

---

### TASK-19 · AWS Infrastructure — Triển khai thực tế (EC2 + RDS + ElastiCache)

**Mục tiêu:** Triển khai hệ thống lên AWS sử dụng kiến trúc tiết kiệm chi phí (Free Tier) với EC2, RDS, và ElastiCache. Cập nhật quy trình deploy bằng GitHub thủ công.

**[ĐÃ TRIỂN KHAI - Kiến trúc thực tế]**

**Prompt:**

```
Cấu hình và tài liệu hóa kiến trúc AWS thực tế cho AI Freelance Marketplace (môi trường tiết kiệm chi phí / học tập):

--- KIẾN TRÚC ĐÃ TRIỂN KHAI ---

IP Public EC2 hiện tại: 54.206.116.105
Region: ap-southeast-2 (Sydney)

1. DATABASE — AWS RDS (MySQL 8.0):
   - Instance: db.t3.micro (Free Tier)
   - Storage: 20GB
   - Public Access: Yes (kết nối trực tiếp từ EC2 qua Security Group)
   - Endpoint: aimarket-db.cp0q0oweyad8.ap-southeast-2.rds.amazonaws.com:3306
   - DB Name: aimarket_db, Username: admin
   - Bảo mật: Security Group chỉ cho phép EC2 Security Group kết nối qua Port 3306
   - Lưu ý: KHÔNG dùng Multi-AZ (tiết kiệm chi phí)

2. CACHE — AWS ElastiCache (Redis OSS):
   - Node: cache.t3.micro (Free Tier)
   - Replication: 0 Replicas, Multi-AZ: Disabled
   - Endpoint: aimarket-redis-ro.rziy3i.ng.0001.apse2.cache.amazonaws.com:6379
   - Bảo mật: KHÔNG bật "Encryption in transit" (tránh lỗi SSL từ Spring Boot)
   - Lưu ý: Endpoint hiển thị là Read-Only endpoint nhưng vẫn dùng được cho cả Read/Write ở cấu hình single node

3. SERVER — AWS EC2 (Ubuntu 24.04 LTS):
   - Instance: t2.micro hoặc t3.micro (1GB RAM)
   - OS: Ubuntu 24.04 / 22.04 LTS
   - Tối ưu RAM: Tạo 2GB Swap để tránh OOM khi build Java/React:
     ```bash
     sudo fallocate -l 2G /swapfile
     sudo chmod 600 /swapfile
     sudo mkswap /swapfile
     sudo swapon /swapfile
     echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
     ```
   - Security Group (Inbound Rules): Port 22 (SSH), Port 80 (HTTP), Port 443 (HTTPS) — tất cả từ 0.0.0.0/0
   - Cài đặt: Docker, Docker Compose, Git

4. CẤU TRÚC TRÊN SERVER:
   - Thư mục code: /home/ubuntu/aimarket/
   - File cấu hình production: /home/ubuntu/aimarket/.env.prod
   - File compose production: /home/ubuntu/aimarket/docker-compose.prod.yml
   - docker-compose.prod.yml chỉ chứa 2 service: backend (Spring Boot) và frontend (React + Nginx)
   - KHÔNG chạy MySQL/Redis local (dùng RDS và ElastiCache thay thế)

5. QUY TRÌNH DEPLOY (Manual CI/CD qua GitHub):

   Bước 1 — Trên máy cá nhân: push code lên GitHub
   ```bash
   git add .
   git commit -m "feat: [Mô tả tính năng]"
   git push origin main
   ```

   Bước 2 — SSH vào server:
   ```bash
   ssh -i aimarket-key.pem ubuntu@54.206.116.105
   ```
   Lưu ý Windows: File .pem phải xóa inherited permissions, chỉ cấp Read cho user hiện tại (dùng icacls)

   Bước 3 — Kéo code mới và build lại:
   ```bash
   cd /home/ubuntu/aimarket
   git pull origin main
   sudo docker compose -f docker-compose.prod.yml up -d --build
   ```

   Bước 4 — Kiểm tra logs:
   ```bash
   sudo docker compose -f docker-compose.prod.yml logs -f
   # Ctrl+C để thoát
   ```

6. FILE .env.prod (các biến quan trọng trên server):
   ```env
   SPRING_PROFILES_ACTIVE=prod
   DB_URL=jdbc:mysql://<RDS_ENDPOINT>:3306/aimarket_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
   DB_USERNAME=admin
   DB_PASSWORD=<password>
   REDIS_HOST=<ELASTICACHE_ENDPOINT>
   REDIS_PORT=6379
   STRIPE_SECRET_KEY=rk_test_...
   OPENAI_API_KEY=sk-proj-...
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USERNAME=<gmail>
   MAIL_PASSWORD=<app_password_16_ky_tu>
   ```

7. TROUBLESHOOTING PHỔ BIẾN:
   - Lỗi SSH "UNPROTECTED PRIVATE KEY FILE": Dùng icacls trên Windows để xóa quyền thừa hưởng
   - Lỗi OOM (Exit Code 137 / Killed): Kiểm tra `free -h`, đảm bảo Swap 2GB đang hoạt động
   - Không truy cập được IP: Kiểm tra Inbound Rules Security Group, đảm bảo Port 80 đã mở (0.0.0.0/0)
   - Redis SSL Error: Tắt "Encryption in transit" trên ElastiCache hoặc thêm `?ssl=false` vào connection string
```

---

### TASK-20 · Security Hardening

**Mục tiêu:** Kiểm tra và tăng cường bảo mật toàn hệ thống.

**Prompt:**

```
Implement security hardening checklist:

BACKEND SECURITY:
1. Input validation toàn diện:
   - Tất cả DTO có @Valid annotation ở controller
   - Custom validator @ValidBudget: budgetMax >= budgetMin
   - HTML sanitization cho description fields: dùng jsoup library để strip XSS tags
   - File upload validation: kiểm tra MIME type (whitelist: pdf, jpg, png, mp4), max size 50MB

2. SQL Injection prevention:
   - Review tất cả @Query, đảm bảo không có string concatenation
   - Dùng @Param với named parameters
   - Chạy OWASP Dependency Check Maven plugin: mvn dependency-check:check

3. Rate Limiting (Bucket4j + Redis):
   - Tạo RateLimitFilter: giới hạn 100 req/min/IP cho public endpoints
   - 1000 req/min cho authenticated users
   - Custom limit cho AI endpoints: 10 calls/hour/user
   - Response header: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset

4. Security Headers (SecurityHeadersFilter.java):
   - X-Content-Type-Options: nosniff
   - X-Frame-Options: DENY
   - X-XSS-Protection: 1; mode=block
   - Content-Security-Policy: default-src 'self'
   - Strict-Transport-Security: max-age=31536000; includeSubDomains

5. CORS Configuration:
   - Chỉ allow từ production frontend domain + localhost (dev)
   - Allow methods: GET, POST, PUT, DELETE, OPTIONS
   - Allow headers: Authorization, Content-Type
   - MaxAge: 3600

6. Audit Logging (AuditLogAspect.java @Aspect):
   - @Around cho tất cả method trong PaymentService, EscrowService, DisputeService, AuthService
   - Log: userId, action, entityType, entityId, request params (sanitize PII), IP address, timestamp
   - Ghi vào bảng audit_logs

7. Secrets Management:
   - Không có giá trị secret nào trong application.yml committed vào Git
   - Tất cả dùng ${SECRET_NAME} từ environment variable
   - .env không được commit (trong .gitignore)
   - Hướng dẫn lấy secrets từ AWS Secrets Manager trong production

FRONTEND SECURITY:
1. Token storage: access token trong memory (Zustand state), refresh token trong httpOnly cookie (yêu cầu backend set cookie)
   - Hoặc nếu không dùng cookie: access token trong sessionStorage, refresh token trong localStorage (đánh đổi)
   - KHÔNG lưu access token trong localStorage (XSS risk)

2. XSS Prevention:
   - Không dùng dangerouslySetInnerHTML
   - Render user content qua DOMPurify trước khi hiển thị

3. CSRF Protection:
   - API dùng JWT Bearer (không bị CSRF)
   - Nếu dùng cookie: thêm CSRF token header

4. Environment variables:
   - Tất cả config qua VITE_* env vars
   - Không hardcode API URLs, keys trong code
   - .env.production không commit

Tạo file SECURITY.md tóm tắt các biện pháp bảo mật đã implement.
```

---

## SPRINT 8 — Testing, Documentation, UAT

---

### TASK-21 · Testing — Backend (Unit + Integration)

**Mục tiêu:** Test coverage >= 70% cho business logic quan trọng.

**Prompt:**

```
Viết test suite đầy đủ cho Spring Boot backend:

UNIT TESTS (JUnit 5 + Mockito):

1. AuthServiceTest:
   - testRegister_Success: mock UserRepository, BCryptEncoder, trả AuthResponse hợp lệ
   - testRegister_EmailAlreadyExists: expect UserAlreadyExistsException
   - testLogin_WrongPassword: expect BadCredentialsException
   - testRefreshToken_Expired: expect TokenExpiredException
   - testLogout_Success: verify token blacklisted in Redis

2. EscrowServiceTest:
   - testLockFunds_InsufficientBalance: expect InsufficientFundsException
   - testLockFunds_Success: verify locked_amount tăng, balance không đổi
   - testReleaseFunds_Success: verify expert balance tăng đúng 90%, fee transaction created
   - testRefundFunds_Success: verify client balance restored

3. JobServiceTest:
   - testCreateJob_NotClientRole: expect ForbiddenException
   - testUpdateJob_NotOwner: expect ForbiddenException
   - testDeleteJob_WithActiveProposals: expect BusinessException

4. ContractServiceTest:
   - testCreateContract_Success: verify proposal ACCEPTED, others REJECTED, job IN_PROGRESS, escrow locked
   - testCreateContract_ProposalAlreadyAccepted: expect ConflictException
   - testApproveMilestone_Success: verify milestone APPROVED, funds released
   - testApproveMilestone_LastOne_ContractCompleted: verify contract status = COMPLETED

5. AIJobAssistantServiceTest:
   - testEnhanceJob_Success: mock AIClient, verify response parsed correctly
   - testEnhanceJob_AIUnavailable: verify fallback response returned (no exception)
   - testEnhanceJob_CachedResponse: verify AIClient NOT called when cache hit

INTEGRATION TESTS (@SpringBootTest + @Testcontainers):

6. AuthIntegrationTest:
   - Dùng MySQL Testcontainer (testcontainers:mysql)
   - Full register -> login -> refresh -> logout flow
   - Verify JWT claims
   - Verify database state sau mỗi bước

7. EscrowIntegrationTest:
   - Full deposit -> lock -> release -> withdraw flow
   - Verify ACID: simulate concurrent transactions (2 threads cùng lock funds)
   - Verify total không vượt balance

8. ContractFlowIntegrationTest:
   - Full flow: createJob -> submitProposal -> createContract -> submitMilestone -> approveMilestone
   - Verify tất cả entity states sau mỗi bước

API TESTS (MockMvc):
9. JobControllerTest:
   - Test tất cả endpoints với valid/invalid payloads
   - Test authentication/authorization (401/403)
   - Test pagination response format

10. Payment webhook test:
    - testWebhook_ValidStripeSignature
    - testWebhook_InvalidSignature: expect 400

Cấu hình coverage: JaCoCo plugin trong pom.xml, minimum 70% line coverage cho packages service/*, entity/*, repository/*.
```

---

### TASK-22 · API Documentation — Swagger/OpenAPI

**Mục tiêu:** Tài liệu API đầy đủ cho frontend dev và handover.

**Prompt:**

```
Implement OpenAPI documentation hoàn chỉnh:

DEPENDENCY: springdoc-openapi-starter-webmvc-ui:2.x (đã thêm Sprint 1)

CONFIG (SwaggerConfig.java):
- @Bean OpenAPI customOpenAPI():
  - info: title "AI Freelance Marketplace API", version "1.0.0", description chi tiết
  - contact: developer info
  - servers: localhost:8080 (dev), https://api.aimarket.com (prod)
  - securitySchemes: BearerAuth (HTTP Bearer JWT)
  - globalSecurity: BearerAuth cho tất cả protected endpoints

ANNOTATION CHO CONTROLLERS:
- @Tag(name = "Authentication", description = "...")
- @Operation(summary = "...", description = "...", security = @SecurityRequirement(name = "BearerAuth"))
- @ApiResponse(responseCode = "200", content = @Content(schema = @Schema(implementation = AuthResponse.class)))
- @ApiResponse(responseCode = "400", description = "Validation Error")
- @ApiResponse(responseCode = "401", description = "Unauthorized")
- @Parameter(description = "...", example = "...") cho tất cả query params

DTOs với @Schema:
- @Schema(description = "Email người dùng", example = "user@example.com")
- @Schema(description = "Role", allowableValues = {"CLIENT", "EXPERT"})

Đảm bảo Swagger UI accessible tại: http://localhost:8080/swagger-ui.html
Export OpenAPI JSON: http://localhost:8080/v3/api-docs

Tạo Postman Collection từ OpenAPI spec (openapi-to-postman converter) với:
- Environment variables: baseUrl, accessToken, refreshToken
- Pre-request script: auto-refresh token
- Test scripts cho từng endpoint

Tạo file docs/API_GUIDE.md: hướng dẫn sử dụng API, authentication flow, error codes.
```

---

### TASK-23 · End-to-End Testing & UAT Checklist

**Mục tiêu:** Test toàn bộ user journeys trước khi deploy production.

**Prompt:**

```
Tạo E2E test suite và UAT checklist:

E2E TESTS với Playwright (hoặc Cypress):

1. Client Journey:
   - Register CLIENT account -> verify email -> login
   - Create Job (DRAFT) -> use AI Enhance -> Publish
   - Browse Marketplace -> view Expert profile
   - View proposals -> Accept proposal -> Create contract with milestones
   - Deposit money (mock) -> verify escrow balance
   - Approve milestone -> verify expert receives payment (90%)
   - Open chat with Expert -> send messages
   - Leave review after contract completion

2. Expert Journey:
   - Register EXPERT -> fill profile -> add skills
   - Create Service -> use AI Service Generator -> submit for review
   - Browse Open Jobs -> Submit Proposal
   - View accepted contract -> Submit deliverable for milestone
   - Check earnings dashboard -> Request withdrawal

3. Admin Journey:
   - Login as ADMIN
   - Approve pending Service
   - View dispute -> resolve as Refund
   - Approve withdrawal request
   - Check analytics dashboard

UAT CHECKLIST (docs/UAT_CHECKLIST.md):

Authentication:
□ Đăng ký với email mới -> nhận email xác nhận
□ Đăng nhập đúng thông tin -> redirect theo role
□ Đăng nhập sai password -> lỗi 401
□ Access token hết hạn -> tự động refresh
□ Logout -> không thể dùng token cũ

Job Management:
□ Tạo job với đủ thông tin -> status DRAFT
□ AI Enhance -> nhận suggestions, apply
□ Publish job -> status OPEN, hiện trong marketplace
□ Expert submit proposal -> client nhận notification
□ Client accept proposal -> contract created, escrow locked

Contract & Payment:
□ Nạp tiền mock -> balance cộng vào
□ Tạo contract -> balance bị lock đúng số tiền
□ Expert submit deliverable -> client nhận notification
□ Client approve -> expert nhận 90%, platform nhận 10%
□ Reject milestone -> expert nhận thông báo sửa lại
□ Tất cả milestones done -> contract COMPLETED

Real-time Features:
□ Gửi tin nhắn -> đối phương nhận tức thì (không refresh)
□ Đang nhập indicator hoạt động
□ Notification bell cập nhật real-time

Security:
□ API không auth trả 401
□ Client không thể access Expert-only API
□ Admin endpoints từ chối non-admin

Performance:
□ Trang marketplace load < 2s
□ Chat message delay < 500ms
□ AI enhance < 5s

Tạo bug report template: docs/BUG_REPORT_TEMPLATE.md
```

---

## Tổng hợp Task List

| # | Task | Sprint | Module | Stack |
|---|------|--------|--------|-------|
| 01 | Project Setup & Docker Compose | S1 | Infrastructure | Docker, Maven, Vite |
| 02 | Database Schema (Flyway) | S1 | Database | MySQL, Flyway |
| 03 | Auth Module Backend | S1 | Auth | Spring Security, JWT, Redis |
| 04 | Auth Module Frontend | S1 | Auth | React, Zustand, Axios |
| 05 | Job Module Backend | S2 | Job | Spring Boot, JPA |
| 06 | Expert Service Backend | S2 | Marketplace | Spring Boot, JPA |
| 07 | Job & Marketplace UI | S2 | UI | React, TanStack Query |
| 08 | Proposal & Contract Backend | S3 | Contract | Spring Boot, @Transactional |
| 09 | Contract & Milestone UI | S3 | UI | React |
| 10 | Payment Integration Backend | S4 | Payment | Stripe, Spring Boot |
| 11 | WebSocket Chat Backend | S4 | Chat | STOMP, Redis Pub/Sub |
| 12 | Chat & Notification UI | S4 | UI | React, STOMP.js |
| 13 | AI Modules Backend | S5 | AI | OpenAI/Anthropic API |
| 14 | AI Modules UI | S5 | UI | React |
| 15 | Dispute, Review, Withdraw | S6 | Business | Spring Boot |
| 16 | Admin Dashboard Backend | S6 | Admin | Spring Boot |
| 17 | Admin Dashboard UI | S6 | UI | React, Recharts |
| 18 | Performance & Caching | S7 | Performance | Redis Cache, @Async |
| 19 | AWS Infrastructure (EC2+RDS+ElastiCache) ✅ | S7 | DevOps | EC2, RDS MySQL, ElastiCache Redis, Docker |
| 20 | Security Hardening | S7 | Security | Bucket4j, jsoup, Audit |
| 21 | Backend Testing | S8 | Testing | JUnit 5, Testcontainers |
| 22 | API Documentation | S8 | Docs | SpringDoc OpenAPI |
| 23 | E2E Testing & UAT | S8 | QA | Playwright/Cypress |

**Tổng: 23 tasks | 8 sprints | ~16 tuần**
