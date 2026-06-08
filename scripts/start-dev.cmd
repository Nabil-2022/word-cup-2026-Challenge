@echo off
set DATABASE_URL=postgresql://user:password@localhost:5432/worldcup_challenge?schema=public
set STRIPE_SECRET_KEY=sk_test_placeholder
set STRIPE_WEBHOOK_SECRET=whsec_placeholder
set ADMIN_SESSION_SECRET=replace-with-a-long-random-secret-value
set ADMIN_EMAIL=admin@example.com
set ADMIN_PASSWORD=replace-with-a-secure-password
set NEXT_PUBLIC_APP_URL=http://127.0.0.1:3000
cd /d "C:\Users\nabil\OneDrive\Documents\world cup 2026 Challenge"
"C:\Program Files\nodejs\npm.cmd" run dev -- --hostname 127.0.0.1 --port 3000
