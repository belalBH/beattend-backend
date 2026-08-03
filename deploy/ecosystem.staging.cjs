module.exports = {
  apps: [
    {
      name: "beattend-staging",
      cwd: "/var/www/beattend-staging/current",
      script: "backend-dist/server.cjs",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env_production: {
        NODE_ENV: "production",
        HOST: "127.0.0.1",
        PORT: 3001
      },
      error_file: "/var/www/beattend-staging/logs/pm2-error.log",
      out_file: "/var/www/beattend-staging/logs/pm2-out.log"
    }
  ]
};
