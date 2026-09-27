# Plan: WhatsApp Embedded Signup on the frontend

Status: **plan only — nothing implemented.**

## Goal

After registration/login, if the tenant isn't onboarded, show a "Connect WhatsApp"
screen/modal with **Connect** and **Skip**. Connect launches Meta's Embedded
Signup popup; the resulting `code` (+ session event) is POSTed to the existing
backend endpoint, which runs the whole onboarding workflow synchronously and
returns the outcome.

## What already exists (backend contract)

- `POST /api/v1/auth/whatsapp/callback` (authenticated) — body
  `EmbeddedSignupCallbackRequest` `{ code, event, waba_id, phone_number_id,
  business_id, waba_ids, current_step, error_code, error_message }`; returns
  `APIResponse<TenantOnboardingData>` `{ status: "registered"|"cancelled"|"error",
  waba_id, display_name, onboarding_status, credit_shared, phone_numbers }`.
- The backend runs `TenantOnboardingWorkflow` and short-circuits on a
  missing/failed `event` (see `EmbeddedSignupCallbackRequest.completed`).

## The gap that shapes this plan

`UserSummary` (returned by `/auth/me` and in `AuthResult`) has **no
`onboarding_status`**, so the frontend can't tell whether to show the connect
prompt. This needs a small **backend** addition (§1). Everything else is frontend.

---

## 1. Backend prerequisite (small, required)

Add the tenant's onboarding state to what the FE already loads on boot:

- Add `onboarding_status: OnboardingStatus | None` (and `waba_id: str | None`) to
  `UserSummary` in `app/schemas/auth.py`, and populate it in `_build_auth_result`
  and the `me` endpoint (join the tenant row / read `current_user.tenant`).
- Result: `/auth/me` and every login/signup response carry `onboarding_status`,
  so the FE reads it from `accountInfo.user`.

*(Alternative: a dedicated `GET /auth/tenant` returning tenant status. Recommend
folding it into `UserSummary` — the FE already fetches `/auth/me` on boot and
caches it in `accountInfo`.)*

---

## 2. Types (`@ros/types`)

`packages/types/src/lib/api/auth.types.ts`:

- Add an `OnboardingStatus` union: `'not_connected' | 'complete' | 'waba_only' |
  'phone_unregistered'`.
- Extend `UserSummary` with `onboarding_status?: OnboardingStatus | null` and
  `waba_id?: string | null`.
- Add `EmbeddedSignupCallbackRequest`, `EmbeddedSignupOutcome`
  (`'registered' | 'cancelled' | 'error'`), and `TenantOnboardingData`,
  mirroring the backend schemas.

## 3. API client (`@ros/api`)

`packages/api/src/lib/axios-client/clients/iamApi.client.ts`:

- Add `embeddedSignupCallback(body: EmbeddedSignupCallbackRequest):
  Promise<ApiResponse<TenantOnboardingData>>` → `POST /auth/whatsapp/callback`.
  It's authenticated, so it rides the existing Bearer/token interceptor — no new
  auth wiring.

## 4. Core hook (`@ros/core`)

`packages/core/src/lib/hooks/auth-api-hooks/`:

- `useConnectWhatsApp()` — a react-query mutation over `embeddedSignupCallback`.
  On `TenantOnboardingData.status === 'registered'`, update the cached user's
  `onboarding_status` (invalidate the `/auth/me` query, or `setUser` with the new
  `onboarding_status`) so the app re-renders without the prompt.
- A small selector, e.g. `const needsWhatsApp = accountInfo.user?.onboarding_status
  !== 'complete'`.

## 5. Meta JS SDK integration (the genuinely new part)

The Embedded Signup popup is Meta's Facebook JS SDK — this is the piece the repo
doesn't have yet.

- **Load the SDK lazily** via a `useFacebookSdk()` hook (inject
  `connect.facebook.net/en_US/sdk.js`, then `FB.init({ appId, version: 'v25.0',
  xfbml: false, autoLogAppEvents: true })`). Lazy so it isn't pulled onto the auth
  screens that don't need it.
- **Config via env** (Vite): `VITE_META_APP_ID` and the Embedded Signup
  **`VITE_META_ES_CONFIG_ID`** (the "configuration ID" from the app's Embedded
  Signup setup).
- **Launch:** `FB.login(cb, { config_id, response_type: 'code',
  override_default_response_type: true, extras: { sessionInfoVersion: '3' } })`.
  The callback's `authResponse.code` is the exchangeable code.
- **Capture the session event:** Meta also emits a `WA_EMBEDDED_SIGNUP` message
  via `window.postMessage` carrying `event`, `waba_id`, `phone_number_id`,
  `current_step`, and error fields. Add a `message` listener (origin-checked to
  `facebook.com`) to capture these and forward them **alongside `code`** in the
  callback body — the backend's `event`-based short-circuit relies on them.
- On `code` (+ event) → call `useConnectWhatsApp`.

## 6. UI — the connect screen/modal (`@ros/components-web` or `apps/web`)

- A `ConnectWhatsAppModal` (or full-screen step): heading, one line of copy,
  **Connect WhatsApp** (launches Embedded Signup) and **Skip for now** (dismiss).
- **States:** idle → launching (popup open) → submitting (POST callback) →
  `registered` (toast success, close, refresh status) / `cancelled` (soft dismiss)
  / `error` (message + retry). Drive these off the mutation + SDK callback.
- **Where it shows:** on the authenticated area (Home/dashboard), conditionally
  when `needsWhatsApp`. It's conditional UI, not a route.

## 7. Placement & routing (`apps/web`)

- Mount the modal in the protected shell. Options: (a) render it from `HomePage`/a
  dashboard layout gated on `needsWhatsApp`; (b) a dedicated `/onboarding/whatsapp`
  route under the `ProtectedRoute` guard for a full-screen step. Recommend the
  **modal on the dashboard** — matches "screen/modal after login" and keeps the
  user in the app.
- **Skip behavior:** dismiss for the session (a state flag), plus a persistent
  "Connect WhatsApp" entry point (header/settings) so they can start it later.
  Since `onboarding_status` stays `not_connected` until they connect, the prompt
  naturally returns next login.

## 8. Env / config (`apps/web`)

- Add `VITE_META_APP_ID` and `VITE_META_ES_CONFIG_ID` to `apps/web` env +
  `.env.example`, read via `import.meta.env`.

---

## Flow (end to end)

```
login/signup ──▶ /auth/me returns onboarding_status
   └─ not "complete" ──▶ show ConnectWhatsApp modal
        ├─ Skip  ──▶ dismiss (returns next session)
        └─ Connect ──▶ load FB SDK ──▶ FB.login(config_id)
                          ├─ capture authResponse.code
                          └─ capture WA_EMBEDDED_SIGNUP event via postMessage
                       └─▶ POST /auth/whatsapp/callback { code, event, ... }
                            └─ backend runs TenantOnboardingWorkflow (sync)
                               └─ returns TenantOnboardingData.status
                                   ├─ registered ──▶ update user.onboarding_status, close
                                   └─ cancelled/error ──▶ message + retry
```

## Open decisions (need your call before implementing)

1. **Backend status exposure**: add `onboarding_status` to `UserSummary`/`/auth/me`
   (recommended) vs a dedicated `GET /auth/tenant`.
2. **Which statuses prompt a connect**: only `not_connected`, or also
   `waba_only` / `phone_unregistered` (partial onboarding) with a "finish setup"
   variant? (Your ask implies just "not onboarded" → I'd treat anything ≠
   `complete` as "needs attention", with `not_connected` = the full connect flow.)
3. **Modal vs full-screen route** for the connect step (recommend modal).
4. **Skip persistence**: session-only (recommended) vs remembered across logins.
5. **Where the connect components live**: `@ros/components-web` (reusable, testable)
   vs `apps/web` (app-local). Recommend `components-web` for the modal, `apps/web`
   for the SDK env wiring.
6. **SDK load**: lazy `useFacebookSdk()` hook (recommended) vs a static `<script>`
   in `index.html`.

## Prerequisites outside code

- The Meta app needs an **Embedded Signup configuration** (to get `config_id`) and
  the app must be able to run it for your test user (dev mode is fine for testing;
  Advanced Access / App Review is needed before onboarding real distributors).
