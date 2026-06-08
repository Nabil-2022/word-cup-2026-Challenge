$env:DATABASE_URL = "postgresql://user:password@localhost:5432/worldcup_challenge?schema=public"
$env:STRIPE_SECRET_KEY = "sk_test_placeholder"
$env:STRIPE_WEBHOOK_SECRET = "whsec_placeholder"
$env:ADMIN_SESSION_SECRET = "replace-with-a-long-random-secret-value"
$env:ADMIN_EMAIL = "admin@example.com"
$env:ADMIN_PASSWORD = "replace-with-a-secure-password"
$env:NEXT_PUBLIC_APP_URL = "http://127.0.0.1:3000"

Set-Location "C:\Users\nabil\OneDrive\Documents\world cup 2026 Challenge"
& "C:\Program Files\nodejs\npm.cmd" run dev -- --hostname 127.0.0.1 --port 3000
