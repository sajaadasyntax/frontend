module.exports = {
  apps: [
    {
      name: 'mayan-frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 1, // Next.js doesn't support cluster mode, single instance
      exec_mode: 'fork', // Fork mode for Next.js
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      // Logging configuration
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // Auto-restart configuration
      autorestart: true,
      watch: false, // Disable watch in production
      max_memory_restart: '1.2G', // Restart if memory exceeds 1.2GB
      // Advanced PM2 features
      min_uptime: '10s', // Minimum uptime before considering app stable
      max_restarts: 10, // Maximum restarts in 1 minute
      restart_delay: 4000, // Delay between restarts (ms)
      // Kill timeout for graceful shutdown
      kill_timeout: 5000,
      // Wait for listen event before considering app online
      wait_ready: true,
      listen_timeout: 10000,
      // Cron restart (optional - restart daily at 3:05 AM)
      // cron_restart: '5 3 * * *',
    }
  ]
}

