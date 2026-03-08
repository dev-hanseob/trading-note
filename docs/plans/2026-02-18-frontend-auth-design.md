# Frontend Authentication System Design

## Goal
카카오 소셜 로그인 + 이메일/비밀번호 로그인을 프론트엔드에 구현하여 사용자 인증 완성.

## Backend API (already implemented)
- `POST /api/auth/signup` - { email, password } -> { email, message }
- `POST /api/auth/login` - { email, password } -> { token, email, message }
- `GET /oauth2/authorization/kakao` - Kakao OAuth2 redirect
- `GET /auth/callback?token=xxx&email=xxx` - OAuth2 success redirect target
- `POST /api/auth/me` - Bearer token -> { id, email, name, provider }
- `POST /api/auth/logout` - Bearer token -> { message, success }

## Pages
- `/login` - Login page (Kakao button + email form + signup link)
- `/signup` - Signup page (email/password form + login link)
- `/auth/callback` - OAuth2 callback handler (stores token, redirects)

## Architecture
- AuthProvider (React Context) wraps app in layout.tsx
- useAuth() hook exposes: user, isLoading, isAuthenticated, login, signup, logout
- Token stored in localStorage as `auth_token`
- API client interceptor auto-attaches Bearer header
- Next.js middleware protects /dashboard, /journal, /analytics, /settings
- Header shows login button or user menu based on auth state

## Token Flow
- Login/OAuth -> receive JWT -> localStorage -> API interceptor -> 401 = auto logout
- No refresh token (24h expiry, re-login needed)
