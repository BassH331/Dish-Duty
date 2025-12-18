# Dish Duty

A fun and easy-to-use dish duty scheduling app. Never forget whose turn it is to wash the dishes!

## Features

- User accounts (signup/login)
- Add/remove people to the rotation
- Set rotation start date to continue existing schedules
- Month and week calendar views
- Data syncs across devices
- Works offline with local caching
- Fun animations and confetti effects

## Deploy to Vercel

### 1. Push to GitHub
```bash
git push origin main
```

### 2. Import to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository

### 3. Set up Vercel KV Storage
1. In your Vercel project dashboard, go to "Storage"
2. Click "Create" and select "KV"
3. Follow the prompts to create a new KV database
4. The environment variables will be automatically added

### 4. Add JWT Secret
1. Go to your project Settings > Environment Variables
2. Add a new variable:
   - Name: `JWT_SECRET`
   - Value: A random 32+ character string (generate at https://generate-secret.vercel.app/32)

### 5. Redeploy
After adding environment variables, redeploy your project for changes to take effect.

## Local Development

```bash
# Install dependencies
npm install

# Install Vercel CLI
npm i -g vercel

# Link to your Vercel project (for KV access)
vercel link

# Pull environment variables
vercel env pull .env.local

# Run development server
vercel dev
```

## Security Features

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens for session management
- XSS prevention with HTML escaping
- Input sanitization and validation
- CORS headers configured
- Security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)

## Tech Stack

- Frontend: Vanilla HTML/CSS/JS
- Backend: Vercel Serverless Functions (Node.js)
- Storage: Vercel KV (Redis)
- Auth: bcryptjs + jsonwebtoken
