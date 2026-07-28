// =========================================================
// BeatAttend PM2 Cluster Process Management Configuration
// Server: Hostinger VPS
// =========================================================

module.exports = {
  apps: [
    {
      name: "beattend-api",
      script: "./node_modules/tsx/dist/cli.mjs",
      args: "server.ts",
      instances: "max",
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env_production: {
        NODE_ENV: "production",
        PORT: 3000
      },
      error_file: "/var/log/beattend/pm2-error.log",
      out_file: "/var/log/beattend/pm2-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z"
    }
  ]
};
