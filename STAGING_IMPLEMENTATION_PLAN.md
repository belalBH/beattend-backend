# 🚀 Staging Implementation & Safety Plan (`STAGING_IMPLEMENTATION_PLAN.md`)

**Target Branch**: `feature/new-ui-complete-system`  
**Staging Subdomain**: `staging.beattend.com` (or IP test path)  
**Safety Protocol**: **Zero Interruption to Live Production `beattend.com`**  

---

## 1. Step-by-Step Staging Integration Pipeline

```
[Production beattend.com] ──(UNTOUCHED)──> [Live MariaDB beattend_db & Firebase]
                                                 │
                                           (Safe Read Sync)
                                                 ▼
[Staging System] ───────> Branch: feature/new-ui-complete-system
                           │
                           ├── 1. Merges Complete HR Logic + New UI Components
                           ├── 2. Connects to Staging DB / Read-Only Copy
                           ├── 3. Validates all 29 HR Modules locally & on Staging
                           └── 4. Passes Mobile App API Contract Verification
```

### Execution Steps:

1. **Create Integration Branch**:
   ```bash
   git checkout -b feature/new-ui-complete-system
   ```

2. **Merge Complete Functional Modules into New UI Wrapper**:
   - Wrap existing full API endpoints (`php_api/api.php` and `server.ts`) inside the new React SPA components in `src/App.tsx`.
   - Replace hardcoded sample data with live `fetch()` API calls to `/api/*` and `/php_api/*`.

3. **Deploy to Staging Environment**:
   - Staging Path: `/var/www/beattend/staging`
   - Test URL: `http://76.13.253.114:8080` or `http://staging.beattend.com` (once staging subdomain DNS is added).

4. **Mobile App Protection Protocol**:
   - Run automated API test suite against `crystal_hr` mobile endpoints (`/api/check-in`, `/api/check-out`, `/api/device-token`).
   - Verify that JSON keys, HTTP status codes, and Firebase auth tokens remain 100% identical.

5. **User Review & Sign-Off**:
   - Present the fully functional, redesigned staging application to the user for interactive testing.
   - **Do NOT redirect `beattend.com` until explicit user sign-off is received**.
