# CI/CD Pipeline Documentation

## Overview
This project uses **GitHub Actions** for automated CI/CD pipeline with separate workflows for frontend, backend, and full-stack deployment.

## Pipeline Structure

```
┌─────────────────────────────────────────────────────────┐
│                  Code Push to GitHub                     │
└────────────────────┬────────────────────────────────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
    ┌─────▼─────┐        ┌─────▼─────┐
    │  Frontend │        │  Backend  │
    │    CI     │        │    CI     │
    └─────┬─────┘        └─────┬─────┘
          │                     │
          ├─ Lint              ├─ Lint
          ├─ Test              ├─ Test
          ├─ Build             └─ Security Audit
          └─ Upload Artifacts
                     │
          ┌──────────┴──────────┐
          │                     │
    ┌─────▼─────┐        ┌─────▼─────┐
    │  Deploy   │        │  Deploy   │
    │ Frontend  │        │  Backend  │
    └───────────┘        └───────────┘
```

## Workflows

### 1. Frontend CI/CD (`.github/workflows/frontend-ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main`
- Only when `interface/` files change

**Jobs:**
- **test-and-build**: Runs on Node 18.x and 20.x
  - Checkout code
  - Install dependencies
  - Run linter
  - Run tests
  - Build production bundle
  - Upload build artifacts

- **deploy-preview**: For pull requests
  - Deploy to preview environment

- **deploy-production**: For main branch
  - Deploy to production

### 2. Backend CI/CD (`.github/workflows/backend-ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main`
- Only when `backend/` files change

**Jobs:**
- **test-and-build**: Runs on Node 18.x and 20.x
  - Checkout code
  - Install dependencies
  - Run linter
  - Run tests
  - Security audit

- **deploy-staging**: For develop branch
  - Deploy to staging environment

- **deploy-production**: For main branch
  - Deploy to production with secrets

### 3. Full Stack CI/CD (`.github/workflows/fullstack-ci.yml`)

**Triggers:**
- Push to `main`
- Pull requests to `main`

**Jobs:**
- **backend-test** & **frontend-test**: Run in parallel
- **build**: After tests pass
- **deploy**: Deploy both frontend and backend

## Setup Instructions

### 1. GitHub Secrets Configuration

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:

```
OPENAI_API_KEY          - Your OpenAI API key
VERCEL_TOKEN           - Vercel deployment token (if using Vercel)
NETLIFY_TOKEN          - Netlify deployment token (if using Netlify)
HEROKU_API_KEY         - Heroku API key (if using Heroku)
RAILWAY_TOKEN          - Railway token (if using Railway)
```

### 2. Branch Protection Rules

Set up branch protection for `main`:
- Require pull request reviews
- Require status checks to pass (select your CI workflows)
- Require branches to be up to date

### 3. Choose Deployment Platform

#### Option A: Vercel (Frontend) + Heroku (Backend)

**Frontend (Vercel):**
```bash
npm install -g vercel
cd interface
vercel --prod --token=$VERCEL_TOKEN
```

**Backend (Heroku):**
```bash
heroku login
heroku create unotes-backend
git subtree push --prefix backend heroku main
```

#### Option B: Netlify (Frontend) + Railway (Backend)

**Frontend (Netlify):**
```bash
npm install -g netlify-cli
cd interface
netlify deploy --prod --dir=build --auth=$NETLIFY_TOKEN
```

**Backend (Railway):**
- Connect GitHub repo to Railway
- Auto-deploys on push to main

#### Option C: Docker + Any Cloud Provider

Create `backend/Dockerfile`:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

Deploy with:
```bash
docker build -t unotes-backend ./backend
docker push your-registry/unotes-backend:latest
```

### 4. Update Workflow Files

Edit the deployment steps in workflow files to match your chosen platform:

**For Vercel + Heroku:**
```yaml
- name: Deploy Frontend to Vercel
  run: |
    cd interface
    npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }}

- name: Deploy Backend to Heroku
  run: |
    git subtree push --prefix backend https://heroku:${{ secrets.HEROKU_API_KEY }}@git.heroku.com/unotes-backend.git main
```

## Environment Variables

### Frontend (interface/.env.production)
```env
REACT_APP_API_URL=https://your-backend-url.com
```

### Backend (backend/.env)
```env
PORT=5000
OPENAI_API_KEY=your_key_here
NODE_ENV=production
```

## Testing the Pipeline

### 1. Test PR Workflow
```bash
git checkout -b feature/test-ci
git add .
git commit -m "test: CI pipeline"
git push origin feature/test-ci
# Create PR on GitHub
```

### 2. Test Main Branch Deploy
```bash
git checkout main
git merge feature/test-ci
git push origin main
# Watch Actions tab on GitHub
```

## Monitoring & Notifications

### Slack Notifications (Optional)

Add to your workflow:
```yaml
- name: Slack Notification
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
  if: always()
```

### Email Notifications

GitHub automatically emails on workflow failures.

## Deployment Platforms Comparison

| Platform | Frontend | Backend | Free Tier | Auto-Deploy |
|----------|----------|---------|-----------|-------------|
| Vercel   | ✅       | ❌      | ✅        | ✅          |
| Netlify  | ✅       | ❌      | ✅        | ✅          |
| Heroku   | ✅       | ✅      | ✅*       | ✅          |
| Railway  | ✅       | ✅      | ✅        | ✅          |
| Render   | ✅       | ✅      | ✅        | ✅          |
| AWS      | ✅       | ✅      | ✅*       | ⚙️          |

*Limited free tier

## Recommended Setup

**For Beginners:**
- Frontend: Vercel or Netlify
- Backend: Railway or Render

**For Production:**
- Frontend: Vercel (with CDN)
- Backend: Railway or AWS
- Database: MongoDB Atlas or PostgreSQL (Railway)

## Troubleshooting

### Tests Failing
- Check test scripts in package.json
- Ensure `CI=true` environment variable

### Build Failing
- Check Node version compatibility
- Verify all dependencies are in package.json

### Deploy Failing
- Verify secrets are set correctly
- Check deployment platform status
- Review logs in Actions tab

## Next Steps

1. ✅ Set up GitHub secrets
2. ✅ Choose deployment platforms
3. ✅ Update workflow deployment steps
4. ✅ Test with a PR
5. ✅ Monitor first production deploy
6. 🔄 Set up monitoring (Sentry, LogRocket)
7. 🔄 Add performance testing
8. 🔄 Set up staging environment
