# 🏗️ KIẾN TRÚC HỆ THỐNG — AIMARKET

> **AIMarket** là nền tảng Freelance Marketplace chuyên về AI, sử dụng mô hình **3-Layer Architecture (Backend) + Separated SPA (Frontend)**, giao tiếp qua **RESTful API + WebSocket (STOMP)**.
>
> ⚠️ File này chỉ mô tả những thành phần **đã được implement và đang dùng thực tế** trong codebase.

---

## 📋 MỤC LỤC

1. [Tổng quan kiến trúc](#1-tổng-quan-kiến-trúc)
2. [Backend — 3-Layer Architecture](#2-backend--3-layer-architecture)
3. [Frontend — Separated SPA](#3-frontend--separated-spa)
4. [Giao tiếp Frontend ↔ Backend](#4-giao-tiếp-frontend--backend)
5. [Cross-cutting Concerns](#5-cross-cutting-concerns)
6. [Cấu trúc package chi tiết](#6-cấu-trúc-package-chi-tiết)
7. [So sánh với MVC](#7-so-sánh-với-mvc)
8. [Deployment Architecture](#8-deployment-architecture)

---

## 1. Tổng quan kiến trúc

```
┌──────────────────────────────────────────────────────────────────────┐
│                         INTERNET / BROWSER                          │
└────────────────────────────┬─────────────────────────────────────────┘
                             │ HTTP / WebSocket
                             ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    NGINX REVERSE PROXY (Port 80)                    │
│   /api/*  ──────────────────────────────────►  Backend :18080       │
│   /ws/*   ──────────────────────────────────►  Backend :18080 (WS)  │
│   /*      ──────────────────────────────────►  Frontend :13000      │
└──────────────────┬────────────────────────────────┬─────────────────┘
                   │ REST API + WebSocket            │ Static Files
                   ▼                                ▼
    ┌──────────────────────────┐     ┌──────────────────────────────┐
    │  BACKEND                 │     │  FRONTEND                    │
    │  Spring Boot 3.3         │     │  React 18 + TypeScript       │
    │  Java 21 — Port 8080     │     │  Vite 5 — Port 3000          │
    │  3-Layer Architecture    │     │  SPA (Single Page App)       │
    └──────────┬───────────────┘     └──────────────────────────────┘
               │ Spring Data JPA
    ┌──────────▼───────────────┐     ┌──────────────────────────────┐
    │  MySQL 8.0               │     │  External APIs (dùng thật)   │
    │  22 tables               │     │  ├─ Stripe (PaymentIntent)   │
    │  Flyway Migration v1–v8  │     │  ├─ Gemini Flash (default)   │
    └──────────────────────────┘     │  ├─ OpenAI GPT-4o-mini       │
                                     │  └─ Anthropic Claude 3 Haiku │
                                     └──────────────────────────────┘
```

> **Chú ý thực tế:**
> - **Redis**: Container có trong Docker Compose nhưng **không được dùng trong code** (không có RedisTemplate, không có Redis Cache, WebSocket dùng in-memory broker).
> - **Cache**: Dùng `ConcurrentMapCacheManager` (JVM in-memory), không phải Redis.
> - **AWS S3 / Mail (SMTP) / MapStruct / jsoup**: Có trong `pom.xml` nhưng **không có implementation** trong code thực tế.

---

## 2. Backend — 3-Layer Architecture

### Nguyên tắc cốt lõi

> **Mỗi layer chỉ được gọi layer ngay bên dưới:**
> `Controller → Service → Repository → Database`
> Tuyệt đối không để Controller gọi thẳng Repository.

### Luồng một request điển hình

```
Browser: POST /api/v1/jobs
      │
      ▼
┌─────────────────────────────────────────────────────┐
│ LAYER 1 — PRESENTATION (Controller)                │
│ • Nhận HTTP request, parse JSON body               │
│ • Validate input: @Valid + JSR-303 annotations     │
│ • Kiểm tra quyền: @PreAuthorize("hasRole(...)")    │
│ • Lấy user hiện tại: @AuthenticationPrincipal      │
│ • Gọi Service → bọc vào ResponseEntity<JSON>       │
│ • KHÔNG chứa business logic                        │
└────────────────────┬────────────────────────────────┘
                     │ jobService.createJob(req, userId)
                     ▼
┌─────────────────────────────────────────────────────┐
│ LAYER 2 — BUSINESS LOGIC (Service)                 │
│ • Toàn bộ quy tắc nghiệp vụ nằm đây               │
│ • @Transactional — đảm bảo atomicity               │
│ • Gọi nhiều Repository và Service khác             │
│ • Gọi External APIs: Stripe, Gemini/OpenAI         │
│ • @Async — các tác vụ nền (notification, embed)    │
│ • @Cacheable — cache kết quả AI (JVM memory)       │
│ • @Scheduled — cron jobs (EscrowService)           │
└────────────────────┬────────────────────────────────┘
                     │ jobRepository.save(job)
                     ▼
┌─────────────────────────────────────────────────────┐
│ LAYER 3 — DATA ACCESS (Repository)                 │
│ • Chỉ nói chuyện với MySQL                        │
│ • Spring Data JPA — tự generate SQL               │
│ • Flyway quản lý schema migration (V1–V8)          │
│ • KHÔNG biết business logic                        │
└─────────────────────────────────────────────────────┘
```

### Layer 1 — Controllers (REST + WebSocket)

| Controller | Endpoint prefix | Chức năng |
|---|---|---|
| `AuthController` | `/api/v1/auth` | Đăng ký, đăng nhập, refresh token |
| `JobController` | `/api/v1/jobs` | CRUD Job, AI Enhance |
| `ServiceController` | `/api/v1/services` | CRUD Gig/Service, AI Generator |
| `ProposalController` | `/api/v1/proposals` | Nộp / Accept / Reject |
| `ContractController` | `/api/v1/contracts` | Hợp đồng, Milestone |
| `WalletController` | `/api/v1/wallet` | Số dư, nạp tiền qua Stripe |
| `WithdrawController` | `/api/v1/withdrawals` | Rút tiền (Expert), Admin duyệt |
| `DisputeController` | `/api/v1/disputes` | Khiếu nại, Admin giải quyết |
| `ReviewController` | `/api/v1/reviews` | Đánh giá sau hợp đồng |
| `AdminController` | `/api/v1/admin` | Dashboard stats, quản lý |
| `UserProfileController` | `/api/v1/profiles` | Profile, portfolio, skills |
| `NotificationController` | `/api/v1/notifications` | Xem thông báo |
| `SkillController` | `/api/v1/skills` | Danh sách kỹ năng |
| `ChatController` *(WS)* | `/app/chat` | WebSocket STOMP chat |
| `AIController` | `/api/v1/ai` | AI trực tiếp (recommend, enhance) |
| `StripeWebhookController` | `/api/v1/webhook/stripe` | Nhận event từ Stripe |

### Layer 2 — Services (Business Logic)

```
Core Services:
├── AuthService            — Đăng ký, login, JWT, refresh, logout
├── JobService             — CRUD Job + @Async cập nhật embedding
├── ProposalService        — Submit / Accept / Reject Proposal
├── ContractService        — Tạo Contract, quản lý Milestone
├── EscrowService          — Luồng tiền + @Scheduled (cron)
├── ExpertServiceService   — CRUD Gig (dịch vụ Expert)
├── WithdrawService        — Tạo lệnh rút, Admin duyệt/từ chối
├── DisputeService         — Mở khiếu nại, Admin phán quyết
├── ReviewService          — Tạo đánh giá sau hợp đồng
├── ChatService            — Lưu/lấy tin nhắn
├── NotificationService    — @Async push notification realtime
├── UserProfileService     — Cập nhật profile, portfolio, skills
└── AdminService           — Thống kê platform, quản lý users/jobs

AI Services:
├── AIJobAssistantService     — @Cacheable enhance job description
├── AIServiceGeneratorService — @Cacheable generate gig content
└── AIRecommendationService   — @Cacheable + @Async expert matching
                                (OpenAI text-embedding-3-small +
                                 Cosine Similarity)
```

**EscrowService — Luồng tiền (State Machine):**

```
[Client nạp tiền]           EscrowAccount.balance += amount
                            Transaction.type = DEPOSIT
      │
[Client Accept Proposal]    EscrowAccount.balance -= amount
                            EscrowAccount.lockedAmount += amount
                            Contract.status = ACTIVE
                            Transaction.type = ESCROW_LOCK
      │
[Client Approve Milestone]  lockedAmount -= milestoneAmount
                            Expert.balance += amount * (1 - 10%)
                            Transaction.type = RELEASE
      │
[Admin Refund - Dispute]    lockedAmount -= contractAmount
                            Client.balance += contractAmount
                            Transaction.type = REFUND
```

**@Scheduled Jobs trong EscrowService:**
- `0 0 * * * *` (mỗi giờ): Tự động dọn expired transactions

**AI Provider (có thể switch qua config):**
- Default: `ai.provider=GEMINI` → `GeminiClient` (free tier 1500 req/day)
- `ai.provider=OPENAI` → `OpenAIClient` (GPT-4o-mini)
- `ai.provider=ANTHROPIC` → `AnthropicClient` (Claude 3 Haiku)

**In-memory Cache (`@Cacheable`):**
- `ai-job-enhance`: Cache kết quả enhance JD theo `title+description`
- `expert-recommendations`: Cache top-N experts theo `jobId`
- `jobs`, `services`, `user-profiles`, `skill-list`: Khai báo trong `CacheConfig`

### Layer 3 — Repositories (Data Access)

Spring Data JPA — chỉ cần interface, framework tự generate SQL:

```java
public interface ContractRepository extends JpaRepository<Contract, Long> {
    // Spring tự sinh SQL từ method name
    List<Contract> findByClientIdAndStatus(Long clientId, ContractStatus status);

    // Custom JPQL khi cần JOIN
    @Query("SELECT c FROM Contract c LEFT JOIN FETCH c.milestones WHERE c.id = :id")
    Optional<Contract> findByIdWithMilestones(@Param("id") Long id);
}
```

**Flyway Migrations:**

| Version | Nội dung |
|---|---|
| V1 | Tạo 22 bảng ban đầu |
| V2 | Seed 30 kỹ năng AI/ML mặc định |
| V3 | Thêm indexes tối ưu query |
| V4 | Seed tài khoản test |
| V5 | Thêm portfolio + job timeline |
| V6 | Thêm skills cho portfolio |
| V7 | Display order cho portfolio |
| V8 | Skills cho Gig (ExpertService) |

---

## 3. Frontend — Separated SPA

SPA = Browser tải app một lần, mọi điều hướng do JavaScript xử lý — không reload trang.

**Cấu trúc tầng:**

```
pages/            ← View (UI Screens)
  ├── LandingPage.tsx
  ├── auth/         (Login, Register, ForgotPassword)
  ├── jobs/         (List, Detail, Create, Edit, MyJobs)
  ├── marketplace/  (List, Detail, Create, Edit, MyServices)
  ├── contracts/    (ContractPage: Milestone + Chat + Submit + Approve)
  ├── dashboard/    (Client, Expert, Admin + sub-pages)
  ├── wallet/       (Balance + History + Withdraw)
  └── profile/      (ProfilePage, PublicProfilePage)

hooks/            ← Business Logic
  ├── useAuth.ts            — Kiểm tra login, role, redirect
  ├── useWebSocket.ts       — Kết nối STOMP (SockJS)
  ├── useChat.ts            — Subscribe /topic/contract/{id}
  ├── useNotifications.ts   — Subscribe /user/me/notifications
  └── useRealtimeEvents.ts  — Events realtime chung

api/              ← Data Access (HTTP calls)
  ├── axiosInstance.ts      — Base axios + JWT interceptor + auto-refresh
  ├── authApi.ts, jobServiceApi.ts, contractApi.ts
  ├── chatApi.ts, aiApi.ts, adminApi.ts, ...

store/            ← Global State
  └── authStore.ts          — Zustand: user info, accessToken, role

components/       ← Reusable UI
  ├── chat/ChatWidget.tsx
  ├── notifications/NotificationBell.tsx
  ├── profile/ExpertReviews.tsx, PortfolioItemModal.tsx
  └── ui/Button.tsx, LoadingSpinner.tsx, SkillSelector.tsx
```

**Frontend stack (dùng thật):**

| Thư viện | Mục đích |
|---|---|
| `react 18` | Core UI framework |
| `react-router-dom v6` | SPA routing |
| `zustand` | Global state (auth) |
| `@tanstack/react-query v5` | Server state + caching |
| `axios` | HTTP client |
| `@stomp/stompjs + sockjs-client` | WebSocket STOMP |
| `@stripe/react-stripe-js` | Stripe payment UI |
| `react-hook-form + zod` | Form + validation |
| `radix-ui/*` | Headless UI components |
| `lucide-react` | Icon set |
| `recharts` | Charts (Admin dashboard) |
| `dompurify` | XSS sanitize trên FE |
| `tailwindcss` | Styling |
| `date-fns` | Date formatting |

---

## 4. Giao tiếp Frontend ↔ Backend

### 4.1 REST API + JWT

```
1. POST /api/v1/auth/login
   Response: { accessToken (15 phút), refreshToken (7 ngày) }

2. Mọi request tiếp theo:
   Authorization: Bearer {accessToken}

3. accessToken hết hạn (15 phút):
   axios interceptor tự gọi POST /api/v1/auth/refresh
   → nhận accessToken mới → retry request gốc

4. refreshToken hết hạn:
   → redirect về Login page

5. Logout:
   → refreshToken bị revoked trong MySQL (field revoked=true)
   → accessToken vẫn hợp lệ đến khi hết hạn 15 phút
     (không có blacklist vì chưa dùng Redis)
```

### 4.2 WebSocket STOMP (Realtime)

Broker: **Simple in-memory** (Spring Boot built-in) — không phải Redis Pub/Sub.

```
Frontend (SockJS + STOMP)           Backend (Spring WebSocket)
   │──── kết nối /ws ──────────────►│ @EnableWebSocketMessageBroker
   │                                 │ enableSimpleBroker(/topic, /queue)
   │ [Gửi tin nhắn]                  │
   │──── SEND /app/chat/send ───────►│ ChatController.handleMessage()
   │                                 │ → ChatService.saveMessage() → MySQL
   │                                 │ → SimpMessagingTemplate.broadcast()
   │◄──── MESSAGE /topic/contract/5 ─│ (tất cả subscriber cùng contract nhận)
   │                                 │
   │ [Nhận notification cá nhân]     │
   │  Subscribe /user/me/queue/notif │
   │◄──── MESSAGE ───────────────────│ NotificationService.push(userId)
```

**WebSocket Channels:**

| Channel | Loại | Dùng cho |
|---|---|---|
| `/topic/contract/{contractId}` | Per-contract | Chat giữa Client & Expert |
| `/user/{userId}/queue/notifications` | Per-user (private) | Notification cá nhân |

---

## 5. Cross-cutting Concerns

Các cơ chế xuyên suốt toàn hệ thống (áp dụng cho mọi request):

### 5.1 Authentication & Authorization

```java
// JWT Filter — gắn vào MỌI request
JwtAuthenticationFilter extends OncePerRequestFilter
→ Đọc header Authorization: Bearer {token}
→ Validate token bằng JwtTokenProvider
→ Set SecurityContext (user info, roles)

// Authorization — khai báo trên controller/method
@PreAuthorize("hasRole('CLIENT')")         // Chỉ CLIENT
@PreAuthorize("hasRole('EXPERT')")         // Chỉ EXPERT
@PreAuthorize("hasRole('ADMIN')")          // Chỉ ADMIN
@PreAuthorize("hasAnyRole('CLIENT','ADMIN')") // Nhiều role
@PreAuthorize("isAuthenticated()")         // Bất kỳ ai đã login
```

### 5.2 Rate Limiting (Bucket4j)

```java
RateLimitFilter extends OncePerRequestFilter
// Đang dùng: ConcurrentHashMap<IP/userId, Bucket>
// Không cần Redis — bucket lưu trong JVM

/api/v1/ai/*  → 10 req/giờ/user   (AI endpoints bảo vệ chi phí API)
authenticated  → 1000 req/phút/user
anonymous      → 100 req/phút/IP
```

### 5.3 Security Headers

```java
SecurityHeadersFilter — tự động gắn vào mọi response:
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  Content-Security-Policy: default-src 'self'
  Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### 5.4 Exception Handling

```java
@ControllerAdvice GlobalExceptionHandler
→ BusinessException        → HTTP 400 + { error: "message" }
→ ResourceNotFoundException → HTTP 404
→ ForbiddenException       → HTTP 403
→ AccessDeniedException    → HTTP 403
→ Exception (fallback)     → HTTP 500
```

### 5.5 Caching (JVM In-memory)

```java
CacheConfig → ConcurrentMapCacheManager (lưu trong JVM heap)

Tên cache đang dùng:
  "ai-job-enhance"          → cache AI enhance result theo title+description
  "expert-recommendations"  → cache top-5 experts theo jobId
  "jobs"                    → (khai báo, chưa gắn @Cacheable)
  "services"                → (khai báo, chưa gắn @Cacheable)
  "user-profiles"           → (khai báo, chưa gắn @Cacheable)
  "skill-list"              → (khai báo, chưa gắn @Cacheable)
```

### 5.6 Async & Scheduling

```java
@EnableAsync (trong AiMarketplaceApplication)
→ NotificationService.sendNotification()    @Async
→ NotificationService.notifyProposalStatus() @Async
→ NotificationService.notifyJobStatus()     @Async
→ JobService.triggerEmbeddingUpdate()       @Async
→ AIRecommendationService.updateExpertEmbedding() @Async

@EnableScheduling (trong AiMarketplaceApplication)
→ EscrowService @Scheduled(cron="0 0 * * * *")  — dọn expired items (mỗi giờ)
→ EscrowService @Scheduled(cron="0 0 * * * *")  — job thứ 2 (mỗi giờ)
```

---

## 6. Cấu trúc package chi tiết

```
com.aimarket/
│
├── AiMarketplaceApplication.java   ← @SpringBootApplication
│                                     @EnableCaching @EnableAsync @EnableScheduling
│
├── ai/                             ← AI Client abstraction
│   ├── AIClient.java               ← Interface: complete(systemPrompt, msg, maxTokens)
│   ├── GeminiClient.java           ← @ConditionalOnProperty(ai.provider=GEMINI) ← DEFAULT
│   ├── OpenAIClient.java           ← @ConditionalOnProperty(ai.provider=OPENAI)
│   └── AnthropicClient.java        ← @ConditionalOnProperty(ai.provider=ANTHROPIC)
│
├── config/
│   ├── SecurityConfig.java         ← Filter chain, CORS, permitAll paths
│   ├── WebSocketConfig.java        ← STOMP endpoint /ws, simple in-memory broker
│   ├── CacheConfig.java            ← ConcurrentMapCacheManager (JVM only)
│   └── SwaggerConfig.java          ← OpenAPI /swagger-ui.html
│
├── controller/                     ← 16 controllers (Layer 1)
├── service/                        ← 16 services (Layer 2)
├── repository/                     ← 15 repositories (Layer 3)
│
├── entity/                         ← JPA Domain Model (15 entities)
│   └── enums/                      ← UserRole, JobStatus, ContractStatus,
│                                     MilestoneStatus, ProposalStatus,
│                                     TransactionType, ServiceStatus,
│                                     DisputeStatus, DisputeResolution,
│                                     UserStatus
│
├── dto/                            ← Request/Response DTOs (không expose entity raw)
│
├── security/
│   ├── JwtTokenProvider.java       ← Tạo/validate/parse JWT
│   ├── JwtAuthenticationFilter.java← Gắn vào mọi request, set SecurityContext
│   ├── CustomUserDetails.java      ← Spring Security principal
│   ├── CustomUserDetailsService.java
│   ├── RateLimitFilter.java        ← Bucket4j rate limiting (JVM ConcurrentHashMap)
│   └── SecurityHeadersFilter.java  ← Gắn security headers vào mọi response
│
├── exception/
│   ├── GlobalExceptionHandler.java ← @ControllerAdvice, xử lý tập trung
│   ├── BusinessException.java      ← 400
│   ├── ResourceNotFoundException.java ← 404
│   ├── ForbiddenException.java     ← 403
│   └── UserAlreadyExistsException.java
│
└── util/
    └── CosineSimilarityUtil.java   ← Tính cosine similarity vector cho AI Recommendation
```

---

## 7. So sánh với MVC

| Tiêu chí | MVC truyền thống (Laravel, Django) | AIMarket (3-Layer + SPA) |
|---|---|---|
| Backend render HTML? | ✅ Có (Blade/Jinja2) | ❌ Không — chỉ JSON |
| Frontend riêng biệt? | ❌ Cùng project | ✅ Container riêng |
| Giao tiếp FE-BE | HTML form POST | REST JSON + WebSocket |
| Scale FE/BE độc lập | ❌ Khó | ✅ Tách container |
| Mobile app dùng lại | ❌ Phải viết API riêng | ✅ Dùng ngay Spring API |
| Real-time WebSocket | ⚠️ Phức tạp | ✅ Tích hợp sẵn |
| Team parallel work | ⚠️ Dễ conflict | ✅ FE/BE hoàn toàn độc lập |

---

## 8. Deployment Architecture

```
VPS Ubuntu Linux
IP: 116.118.6.40  /  Domain: aimarketswp.duckdns.org
│
▼ docker-compose.vps.yml
│
├── Nginx Host (Port 80)
│     /api/*  → proxy 127.0.0.1:18080  (Backend REST)
│     /ws/*   → proxy 127.0.0.1:18080  (WebSocket + Upgrade header)
│     /*      → proxy 127.0.0.1:13000  (Frontend)
│
├── aimarket-frontend (:13000)
│     Nginx trong Docker: serve React static files
│     → 404 redirect về index.html (React Router)
│     → Cache static assets 7 ngày
│
├── aimarket-backend (:18080)
│     Spring Boot Java 21
│     depends_on: mysql (healthy), redis (healthy, nhưng không dùng thật)
│
├── aimarket-mysql (3306, nội bộ)
│     MySQL 8.0
│     Init: aimarket_db.sql + seed_data.sql
│     innodb-buffer-pool-size=256M, max-connections=200
│
└── aimarket-redis (6379, nội bộ) ← Container chạy nhưng app không kết nối
      Redis 7 Alpine, AOF persistence, 256MB LRU
      [Chuẩn bị cho tương lai: distributed cache khi scale out]

Network: aimarket-vps-network (bridge, isolated)
```

---

## 🔑 Key Takeaways

| # | Điểm mạnh thiết kế |
|---|---|
| 1 | **3-Layer giúp test dễ** — Service unit test độc lập với Mockito |
| 2 | **DTO tách biệt Entity** — Không expose raw Entity ra API |
| 3 | **@Transactional ở Service** — Đảm bảo atomicity nhiều DB ops |
| 4 | **Stateless JWT** — Không lưu session, dễ scale horizontal |
| 5 | **AI Client abstraction** — Interface + 3 impl, swap qua config |
| 6 | **Flyway Migration** — Schema versioned, team không conflict |
| 7 | **@Async Notification** — Push realtime không block request chính |
| 8 | **Rate Limit per endpoint** — AI API bảo vệ riêng (10 req/giờ) |
