# Reflective Log — Setup Guide

A personal reflective journal for professional growth.
Built with React + TypeScript, Supabase (database & auth), deployed on GitHub Pages.

---

## Accounts You Need to Create

You will need accounts on **three platforms** — all free:

| Platform | What it does | URL |
|---|---|---|
| GitHub | Stores your code + hosts the website | github.com |
| Supabase | Your database + login system | supabase.com |
| (Your browser) | Runs the app | — |

---

## Step 1 — Create a GitHub Account

1. Go to **https://github.com** and click **Sign up**
2. Choose a username (e.g. `yourname`) — your app will live at `yourname.github.io/reflective-log`
3. Verify your email address
4. Choose the **Free** plan

---

## Step 2 — Create a Supabase Account

1. Go to **https://supabase.com** and click **Start your project**
2. Sign up with GitHub (easiest) or with your email
3. Once logged in, click **New project**
4. Fill in:
   - **Name**: `reflective-log`
   - **Database password**: choose a strong password and save it somewhere safe
   - **Region**: choose the closest to you (e.g. `West EU (Ireland)`)
5. Click **Create new project** — wait ~2 minutes for it to set up

---

## Step 3 — Set Up the Database

1. In your Supabase project, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Open the file `supabase-schema.sql` from this project
4. Copy the entire contents and paste it into the SQL editor
5. Click **Run** (or press Cmd+Enter)
6. You should see "Success. No rows returned" — that means it worked

---

## Step 4 — Get Your Supabase Keys

1. In Supabase, click **Project Settings** (gear icon, bottom left)
2. Click **API** in the settings menu
3. You need two values — copy them somewhere:
   - **Project URL** — looks like `https://abcdefgh.supabase.co`
   - **anon / public key** — a long string starting with `eyJ...`

---

## Step 5 — Upload the Code to GitHub

### Option A — GitHub Desktop (easiest, no command line)

1. Download **GitHub Desktop** from https://desktop.github.com
2. Sign in with your GitHub account
3. Click **File > Add local repository**
4. Navigate to this project folder and select it
5. Click **Publish repository**
   - Name: `reflective-log`
   - Keep **Private** unchecked (must be public for GitHub Pages)
6. Click **Publish repository**

### Option B — Command line

```bash
cd path/to/reflective-log
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/reflective-log.git
git push -u origin main
```

---

## Step 6 — Add Your Supabase Keys to GitHub

GitHub needs your Supabase keys to build the app. We add them as **secrets** (so they stay private):

1. Go to your repository on GitHub: `github.com/YOUR_USERNAME/reflective-log`
2. Click **Settings** (top tab)
3. In the left sidebar, click **Secrets and variables > Actions**
4. Click **New repository secret** and add each one:

   | Secret name | Value |
   |---|---|
   | `VITE_SUPABASE_URL` | Your Supabase Project URL |
   | `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key |

---

## Step 7 — Enable GitHub Pages

1. In your GitHub repository, go to **Settings**
2. Click **Pages** in the left sidebar
3. Under **Source**, select **GitHub Actions**
4. Click **Save**

---

## Step 8 — Trigger Your First Deployment

1. Go to the **Actions** tab in your GitHub repository
2. If the workflow hasn't run yet, make a small edit to any file and push it
3. You'll see a workflow called **Deploy to GitHub Pages** running
4. Wait ~2 minutes for it to complete (green tick ✓)
5. Your app is now live at: `https://YOUR_USERNAME.github.io/reflective-log`

---

## Step 9 — Configure Supabase Auth

By default, Supabase sends a confirmation email when you sign up. For personal use, you can disable this:

1. In Supabase, go to **Authentication > Providers**
2. Click **Email**
3. Toggle off **Confirm email** (so you can sign in immediately after signup)
4. Click **Save**

---

## Step 10 — Create Your Account in the App

1. Visit `https://YOUR_USERNAME.github.io/reflective-log`
2. Click **Create a new account**
3. Enter your email and a password
4. You're in — start your first entry!

---

## Local Development (Optional)

If you want to run the app on your computer to test changes:

1. Install **Node.js** from https://nodejs.org (choose LTS version)
2. Open Terminal in the project folder
3. Create a `.env` file (copy from `.env.example`):
   ```
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```
4. Run:
   ```bash
   npm install
   npm run dev
   ```
5. Open `http://localhost:5173/reflective-log` in your browser

---

## How Deployments Work Going Forward

Every time you push a change to the `main` branch on GitHub, the app automatically rebuilds and deploys. You never need to do anything manually after the first setup.

---

## Your Data

- All entries are stored in your **Supabase database** (PostgreSQL)
- Only you can read your entries (row-level security is enforced)
- To export your data: Supabase > Table Editor > `entries` > Export as CSV
- Free tier includes: 500MB file storage, 50k monthly active users, 2 free projects

---

## Troubleshooting

**App shows blank page after deployment**
→ Check the Actions tab for build errors. Usually means the Supabase secrets weren't set correctly.

**Can't sign in**
→ Check Supabase > Authentication > Make sure "Confirm email" is disabled for easy testing.

**Database errors**
→ Make sure you ran the SQL schema in Step 3 correctly.

---

*Built with React + TypeScript + Vite + Supabase*
