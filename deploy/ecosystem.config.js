// =========================================================
// BeatAttend Enterprise PM2 Process Configuration
// Location: deploy/ecosystem.config.js
// Execution Mode: Single Fork (Near-Zero-Downtime)
// =========================================================

module.exports = {
  apps: [
    {
      name: "beattend-api",
      cwd: "/var/www/beattend/current",
      script: "backend-dist/server.cjs",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env_production: {
        NODE_ENV: "production",
        HOST: "127.0.0.1",
        PORT: 3000
      },
      error_file: "/var/www/beattend/logs/pm2-error.log",
      out_file: "/var/www/beattend/logs/pm2-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z"
    }
  ]
};
