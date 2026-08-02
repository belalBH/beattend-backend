# 🔐 Final Environment Variable Inventory (`FINAL_ENVIRONMENT_VARIABLES.md`)

**Server Target**: Hostinger VPS (`76.13.253.114`)  
**Backend Storage**: `/var/www/beattend/shared/backend.env`  
**PHP Storage**: `/var/www/beattend/shared/php.env`  
**Verification Status**: **`[VERIFIED VIA CODEBASE SEARCH]`**  

---

## 1. Node.js Environment Inventory (`shared/backend.env`)

```ini
NODE_ENV=production
HOST=127.0.0.1
PORT=3000
APP_URL=https://beattend.com
API_URL=https://beattend.com/api
JWT_SECRET="VERIFIED_SECRET_TOKEN"

# Firebase Cloud Engine
FIREBASE_PROJECT_ID="beattend-app"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk@beattend-app.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

# AI Engine
GEMINI_API_KEY="VERIFIED_GEMINI_KEY"

# Operational Paths & Logging
UPLOAD_PATH="/var/www/beattend/shared/uploads"
DOCUMENTS_PATH="/var/www/beattend/shared/documents"
LOG_LEVEL="info"
CORS_ALLOWED_ORIGINS="https://beattend.com,https://www.beattend.com"
```

---

## 2. PHP API Environment Inventory (`shared/php.env`)

```ini
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=beattend_db
DB_USER=beattend_user
DB_PASS="VERIFIED_DB_PASSWORD"
```
