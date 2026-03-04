# Sign in with Amazon — Setup & Flow Guide

## Overview

FitView AI supports **Login with Amazon (LWA)** OAuth 2.0, allowing users to sign in using their existing Amazon account. This eliminates the need for a separate email/password registration and leverages the trust of Amazon's identity platform.

---

## How to Set Up Login with Amazon

### Step 1: Create a Login with Amazon App

1. Go to the [Amazon Developer Console](https://developer.amazon.com/loginwithamazon/console/site/lwa/overview.html)
2. Click **"Create a New Security Profile"**
3. Fill in:
   - **Security Profile Name**: `FitView AI`
   - **Security Profile Description**: `Virtual try-on platform login`
   - **Consent Privacy Notice URL**: Your privacy policy URL
4. Click **Save**

### Step 2: Configure Web Settings

1. After creating the profile, click the **gear icon** next to it
2. Select **"Web Settings"**
3. Add your **Allowed Origins**:
   ```
   http://localhost:3000          (development)
   https://yourdomain.com         (production)
   ```
4. Add your **Allowed Return URLs**:
   ```
   http://localhost:3000/auth/amazon/callback      (development)
   https://yourdomain.com/auth/amazon/callback      (production)
   ```
5. Note down the **Client ID** and **Client Secret**

### Step 3: Set Environment Variables

**Backend** — add to `backend/.env`:
```env
LWA_CLIENT_ID=amzn1.application-oa2-client.your-client-id-here
LWA_CLIENT_SECRET=your-client-secret-here
```

**Frontend** — add to `frontend/.env.local`:
```env
NEXT_PUBLIC_LWA_CLIENT_ID=amzn1.application-oa2-client.your-client-id-here
```

> The Client ID is the same in both files. Only the backend needs the secret.

### Step 4: Start the App

```bash
# Backend
cd backend
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend
bun --bun next dev
```

---

## How the Login Flow Works

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Browser  │     │  Amazon.com  │     │   Frontend   │     │   Backend    │
└─────┬─────┘     └──────┬───────┘     └──────┬───────┘     └──────┬───────┘
      │                  │                    │                    │
      │  1. Click "Sign in with Amazon"       │                    │
      │─────────────────────────────────────>│                    │
      │                  │                    │                    │
      │  2. Redirect to Amazon consent page   │                    │
      │<─────────────────────────────────────│                    │
      │                  │                    │                    │
      │  3. User logs in & grants permission  │                    │
      │─────────────────>│                    │                    │
      │                  │                    │                    │
      │  4. Amazon redirects back with ?code=XXX                   │
      │<─────────────────│                    │                    │
      │                  │                    │                    │
      │  5. Callback page sends code to backend                    │
      │──────────────────────────────────────────────────────────>│
      │                  │                    │                    │
      │                  │  6. Backend exchanges code for token    │
      │                  │<───────────────────────────────────────│
      │                  │                    │                    │
      │                  │  7. Backend fetches user profile        │
      │                  │<───────────────────────────────────────│
      │                  │                    │                    │
      │  8. Backend returns JWT tokens + user data                 │
      │<─────────────────────────────────────────────────────────│
      │                  │                    │                    │
      │  9. User lands on /dashboard, logged in                    │
      │                  │                    │                    │
```

### Step-by-Step Breakdown

#### 1. User Clicks the Button
On `/login` or `/register`, the user clicks the yellow **"Sign in with Amazon"** button. This redirects them to:
```
https://www.amazon.com/ap/oa
  ?client_id=amzn1.application-oa2-client.xxx
  &scope=profile
  &response_type=code
  &redirect_uri=http://localhost:3000/auth/amazon/callback
```

#### 2. Amazon Consent Page
Amazon shows a login/consent screen. The user enters their Amazon credentials and approves sharing their profile.

#### 3. Amazon Redirects Back
After approval, Amazon redirects to:
```
http://localhost:3000/auth/amazon/callback?code=ANdNAVhyhqirUelHGEHA
```

#### 4. Callback Page Exchanges the Code
The callback page at `frontend/src/app/auth/amazon/callback/page.tsx`:
- Extracts the `code` from the URL
- Uses a `useRef` guard to prevent double-exchanges (React Strict Mode protection)
- Calls `loginWithAmazon(code, redirectUri)` from the auth store

#### 5. Backend Processes the Code
The auth store sends a POST to `POST /api/v1/auth/amazon/callback`:
```json
{
  "code": "ANdNAVhyhqirUelHGEHA",
  "redirect_uri": "http://localhost:3000/auth/amazon/callback"
}
```

The backend (`auth_service.amazon_oauth_callback`) then:

1. **Exchanges the code** for an Amazon access token:
   ```
   POST https://api.amazon.com/auth/o2/token
   ```

2. **Fetches the user profile** using that token:
   ```
   GET https://api.amazon.com/user/profile
   → { "user_id": "amzn1.account.xxx", "email": "user@email.com", "name": "John" }
   ```

3. **Finds or creates the local user**:
   - If a user with that email exists → logs them in and links the Amazon ID
   - If no user exists → creates a new user with `auth_provider: "amazon"` and no password

4. **Issues JWT tokens** (same `create_access_token` / `create_refresh_token` as regular login)

#### 6. User is Logged In
The frontend stores the JWT in `localStorage` and redirects to `/dashboard`.

---

## Key Files

| File | Purpose |
|------|---------|
| `backend/app/core/config.py` | `LWA_CLIENT_ID` and `LWA_CLIENT_SECRET` settings |
| `backend/app/models/user.py` | `AmazonCallbackRequest` schema, `auth_provider` & `amazon_user_id` fields |
| `backend/app/services/auth_service.py` | `amazon_oauth_callback()` — core OAuth logic |
| `backend/app/api/v1/endpoints/auth.py` | `POST /auth/amazon/callback` endpoint |
| `frontend/src/lib/store/authStore.ts` | `loginWithAmazon()` action |
| `frontend/src/app/auth/amazon/callback/page.tsx` | OAuth callback handler page |
| `frontend/src/app/login/page.tsx` | Amazon button on login |
| `frontend/src/app/register/page.tsx` | Amazon button on register |

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| **Existing email user signs in with Amazon** | Finds the user by email, links `amazon_user_id`, logs them in |
| **Amazon-only user tries email/password login** | Password is empty string → `verify_password` fails → standard "Invalid email or password" error |
| **Amazon account has no email** | Returns `400: No email associated with this Amazon account` |
| **Double-click / React Strict Mode** | `useRef` guard prevents the auth code from being exchanged twice |
| **Amazon auth code expired or invalid** | Returns `400: Failed to exchange Amazon authorization code` |

---

## API Reference

### `POST /api/v1/auth/amazon/callback`

**Request Body:**
```json
{
  "code": "string (required) — authorization code from Amazon redirect",
  "redirect_uri": "string (required) — must match the redirect URI used in the initial request"
}
```

**Success Response (200):**
```json
{
  "access_token": "eyJhbGciOi...",
  "refresh_token": "eyJhbGciOi...",
  "token_type": "bearer",
  "user": {
    "id": "abc123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer",
    "created_at": "2026-03-04T10:00:00Z"
  }
}
```

**Error Responses:**
| Status | Detail |
|--------|--------|
| 400 | Failed to exchange Amazon authorization code |
| 400 | Failed to fetch Amazon user profile |
| 400 | No email associated with this Amazon account |
