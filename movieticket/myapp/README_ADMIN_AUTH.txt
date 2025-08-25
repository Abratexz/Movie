Admin + Auth + Forgot Password setup

1) Install packages:
   npm i express-session express-mysql-session bcrypt nodemailer mysql2 dotenv

2) Copy these folders/files into your project (merge):
   - app.js (replace your current if you want these routes wired)
   - controllers/, middleware/, routes_auth.js -> place as shown
   - views/auth/*, views/admin/*
   - models/db.js
   - schema_additions.sql
   - scripts/seed_admin.js

3) Update .env (add):
   SESSION_SECRET=changeme
   APP_URL=http://localhost:3000
   # Optional SMTP for emails:
   # SMTP_HOST=smtp.gmail.com
   # SMTP_PORT=587
   # SMTP_USER=you@gmail.com
   # SMTP_PASS=your-app-password
   # MAIL_FROM="Movie Ticket <you@gmail.com>"

4) Run SQL additions:
   Import schema_additions.sql in phpMyAdmin (movieticket DB).

5) Seed an admin:
   node scripts/seed_admin.js admin@example.com admin123 "Admin"

6) Start the app:
   npm start
   Login at /auth/login using the seeded admin.
   - Admin Movies: /admin/movies
   - Admin Users:  /admin/users
   - Forgot password: /auth/forgot (shows the reset link on-screen in dev)
