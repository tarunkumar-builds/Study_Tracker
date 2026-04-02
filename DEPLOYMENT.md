# Study Tracker - Complete Deployment Guide

This guide covers deploying both backend and frontend to production.

## 📋 Pre-Deployment Checklist

- [ ] All features tested locally
- [ ] Environment variables configured
- [ ] Database backup created
- [ ] API endpoints working
- [ ] Frontend builds successfully
- [ ] CORS configured correctly
- [ ] Security best practices implemented

## 🗄️ Database Deployment

### Option 1: MongoDB Atlas (Recommended)

1. **Create Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free tier (512MB storage)

2. **Create Cluster**
   - Click "Build a Database"
   - Choose "Shared" (Free)
   - Select cloud provider and region
   - Click "Create Cluster"

3. **Configure Database Access**
   - Go to "Database Access"
   - Add new database user
   - Choose password authentication
   - Note username and password

4. **Configure Network Access**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0)
   - Or add specific deployment platform IPs

5. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your password
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/study-tracker`

### Option 2: Railway MongoDB

1. Create new project in Railway
2. Add "MongoDB" from marketplace
3. Connection string auto-generated
4. Use `MONGO_URL` variable

## 🚀 Backend Deployment

### Option 1: Railway (Easiest)

1. **Create Account**
   - Go to [Railway.app](https://railway.app)
   - Sign in with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Select `backend` directory

3. **Configure Root Directory**
   - Settings → Root Directory: `/backend`
   - Or move backend files to root

4. **Add Environment Variables**
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/study-tracker
   JWT_SECRET=generate_strong_secret_here
   JWT_EXPIRE=7d
   CLIENT_URL=https://your-frontend-domain.com
   ```

5. **Generate Strong JWT Secret**
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

6. **Deploy**
   - Railway auto-deploys on push
   - Get deployment URL from settings
   - Example: `https://study-tracker-production.up.railway.app`

### Option 2: Render

1. **Create Account**
   - Go to [Render.com](https://render.com)
   - Sign in with GitHub

2. **Create Web Service**
   - New → Web Service
   - Connect your repository

3. **Configure Service**
   ```
   Name: study-tracker-backend
   Root Directory: backend
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```

4. **Add Environment Variables**
   - Same as Railway above

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 min)

### Option 3: Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login**
   ```bash
   heroku login
   ```

3. **Create App**
   ```bash
   cd backend
   heroku create study-tracker-backend
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI="mongodb+srv://..."
   heroku config:set JWT_SECRET="your-secret"
   heroku config:set CLIENT_URL="https://your-frontend.com"
   ```

5. **Deploy**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

### Option 4: DigitalOcean App Platform

1. Create account on DigitalOcean
2. Apps → Create App
3. Connect GitHub repository
4. Select `backend` directory
5. Configure build and run commands
6. Add environment variables
7. Deploy

### Option 5: AWS EC2 (Advanced)

1. Launch EC2 instance (Ubuntu)
2. Install Node.js and MongoDB
3. Clone repository
4. Configure PM2 for process management
5. Set up Nginx reverse proxy
6. Configure SSL with Let's Encrypt

## 🎨 Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd frontend
   vercel
   ```

4. **Configure Environment Variable**
   - Go to Vercel dashboard
   - Project Settings → Environment Variables
   - Add: `VITE_API_URL` = `https://your-backend-url.com/api`

5. **Production Deploy**
   ```bash
   vercel --prod
   ```

**Or via GitHub:**
1. Push code to GitHub
2. Go to [Vercel.com](https://vercel.com)
3. Import repository
4. Configure root directory: `frontend`
5. Add environment variables
6. Deploy

### Option 2: Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build**
   ```bash
   cd frontend
   npm run build
   ```

3. **Deploy**
   ```bash
   netlify deploy --prod --dir=dist
   ```

**Or via GitHub:**
1. Go to [Netlify.com](https://netlify.com)
2. New site from Git
3. Choose repository
4. Configure:
   ```
   Base directory: frontend
   Build command: npm run build
   Publish directory: frontend/dist
   ```
5. Add environment variable: `VITE_API_URL`
6. Deploy

### Option 3: GitHub Pages (Static Only)

1. **Install gh-pages**
   ```bash
   cd frontend
   npm install -D gh-pages
   ```

2. **Update package.json**
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     },
     "homepage": "https://username.github.io/study-tracker"
   }
   ```

3. **Deploy**
   ```bash
   npm run deploy
   ```

### Option 4: Firebase Hosting

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login**
   ```bash
   firebase login
   ```

3. **Initialize**
   ```bash
   cd frontend
   firebase init hosting
   ```

4. **Configure**
   - Public directory: `dist`
   - Single-page app: Yes
   - Automatic builds: No

5. **Build and Deploy**
   ```bash
   npm run build
   firebase deploy
   ```

## 🔒 Security Configuration

### Backend Security

1. **Use Strong JWT Secret**
   ```bash
   # Generate secure random string
   openssl rand -base64 64
   ```

2. **Enable HTTPS**
   - Most platforms provide automatic HTTPS
   - Or use Let's Encrypt for custom domains

3. **Set Secure Headers**
   ```js
   // In server.js
   app.use(helmet());
   ```

4. **Rate Limiting**
   ```js
   import rateLimit from 'express-rate-limit';
   
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 100
   });
   
   app.use('/api', limiter);
   ```

5. **Environment Variables**
   - Never commit `.env` files
   - Use platform-specific secret management

### Frontend Security

1. **Environment Variables**
   - Only use `VITE_` prefix for public variables
   - Never store secrets in frontend

2. **CORS Configuration**
   ```js
   // backend/server.js
   app.use(cors({
     origin: [
       'https://your-frontend-domain.com',
       'http://localhost:5173'
     ],
     credentials: true
   }));
   ```

## 🌐 Custom Domain Setup

### Backend Domain

1. **Add Domain in Platform**
   - Railway: Settings → Domains
   - Render: Settings → Custom Domain
   - Vercel: Settings → Domains

2. **Configure DNS**
   ```
   Type: CNAME
   Name: api
   Value: your-platform-url.com
   ```

3. **Update Environment Variables**
   - Update `CLIENT_URL` in backend
   - Update `VITE_API_URL` in frontend

### Frontend Domain

1. **Add Domain in Platform**
2. **Configure DNS**
   ```
   Type: A
   Name: @
   Value: platform-ip-address
   
   Type: CNAME
   Name: www
   Value: your-platform-url.com
   ```

## 🔄 CI/CD Setup

### GitHub Actions (Backend)

Create `.github/workflows/backend.yml`:

```yaml
name: Deploy Backend

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: cd backend && npm install
      - run: cd backend && npm test
      # Add deployment steps for your platform
```

### GitHub Actions (Frontend)

Create `.github/workflows/frontend.yml`:

```yaml
name: Deploy Frontend

on:
  push:
    branches: [main]
    paths:
      - 'frontend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: cd frontend && npm install
      - run: cd frontend && npm run build
      # Add deployment steps
```

## 📊 Monitoring & Logging

### Backend Monitoring

1. **Error Tracking**
   - Use Sentry or similar service
   - Install: `npm install @sentry/node`
   - Configure in `server.js`

2. **Performance Monitoring**
   - Use platform-built-in monitoring
   - Or integrate New Relic, DataDog

3. **Logs**
   - Railway/Render: Built-in log viewer
   - Use `winston` for structured logging

### Frontend Monitoring

1. **Error Tracking**
   - Use Sentry browser SDK
   - Install: `npm install @sentry/react`

2. **Analytics**
   - Google Analytics
   - Mixpanel
   - Plausible (privacy-friendly)

## 🧪 Testing in Production

1. **Health Checks**
   ```bash
   # Test backend
   curl https://your-api-domain.com/api/health
   
   # Expected response:
   {"success":true,"message":"Study Tracker API is running"}
   ```

2. **Authentication Flow**
   - Register new account
   - Login
   - Access protected routes
   - Logout

3. **CRUD Operations**
   - Create subject
   - Add chapters/topics
   - Create notes
   - Test flashcards

4. **Performance**
   - Use Lighthouse for frontend
   - Test API response times

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check `CLIENT_URL` in backend
   - Verify CORS configuration
   - Check browser console

2. **MongoDB Connection**
   - Verify connection string
   - Check IP whitelist
   - Ensure database user has permissions

3. **Environment Variables Not Loading**
   - Restart deployment
   - Check variable names
   - Verify platform-specific prefixes

4. **Build Failures**
   - Check build logs
   - Verify Node version
   - Test build locally first

5. **API Timeout**
   - Increase platform timeout settings
   - Optimize database queries
   - Add caching

## 📈 Scaling

### Database Scaling

1. **MongoDB Atlas**
   - Upgrade cluster tier
   - Enable sharding
   - Add read replicas

2. **Indexing**
   ```js
   // Add indexes for performance
   userSchema.index({ email: 1 });
   subjectSchema.index({ userId: 1, createdAt: -1 });
   ```

### Backend Scaling

1. **Horizontal Scaling**
   - Most platforms auto-scale
   - Configure instance count

2. **Caching**
   - Use Redis for session storage
   - Cache frequent queries

3. **Load Balancing**
   - Platforms handle automatically
   - Or use Nginx for custom setup

### Frontend Scaling

1. **CDN**
   - Vercel/Netlify include CDN
   - Or use Cloudflare

2. **Image Optimization**
   - Use WebP format
   - Lazy load images
   - Compress assets

3. **Code Splitting**
   - Already implemented with React Router
   - Optimize bundle size

## 💰 Cost Estimation

### Free Tier Options

- **MongoDB Atlas**: Free 512MB
- **Railway**: $5/month credit
- **Render**: Free tier available
- **Vercel**: Free for personal projects
- **Netlify**: Free tier generous

### Paid Recommendations

For production with moderate traffic:
- Database: $9-15/month (MongoDB Atlas M10)
- Backend: $7-20/month (Railway/Render)
- Frontend: Free (Vercel/Netlify)
- Domain: $10-15/year

**Total: ~$20-35/month**

## 🎉 Post-Deployment

1. **Update README**
   - Add live demo links
   - Update environment setup

2. **Monitor Performance**
   - Set up alerts
   - Check error rates
   - Monitor response times

3. **User Feedback**
   - Add feedback mechanism
   - Monitor user issues
   - Iterate improvements

4. **Backup Strategy**
   - Automated database backups
   - Version control for code
   - Document recovery procedures

## 📚 Resources

- [Railway Docs](https://docs.railway.app/)
- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Netlify Docs](https://docs.netlify.com/)

---

Good luck with your deployment! 🚀
