# 🚀 Production Deployment Guide

This guide covers deploying the Fruits Explorer application to production with enterprise-grade configurations.

## 📋 Pre-Deployment Checklist

### ✅ Code Quality
- [ ] All tests passing (`npm test`)
- [ ] Test coverage > 80% (`npm run test:coverage`)
- [ ] No TypeScript errors (`npm run build`)
- [ ] Bundle size optimized (`npm run analyze`)
- [ ] Performance metrics within acceptable ranges

### ✅ Environment Configuration
- [ ] Production environment variables set
- [ ] API endpoints configured
- [ ] Sentry DSN configured
- [ ] RUM endpoint configured
- [ ] Service worker enabled

### ✅ Security
- [ ] Environment variables secured
- [ ] API keys rotated
- [ ] HTTPS enforced
- [ ] CSP headers configured
- [ ] Security headers implemented

## 🏗️ Build Process

### 1. Production Build
```bash
# Clean install dependencies
npm ci

# Run tests
npm test -- --coverage --watchAll=false

# Build for production
npm run build

# Analyze bundle size
npm run analyze
```

### 2. Build Optimization
```bash
# Enable production optimizations
export NODE_ENV=production
export GENERATE_SOURCEMAP=false

# Build with optimizations
npm run build
```

### 3. Bundle Analysis
```bash
# Interactive bundle analysis
npm run analyze

# Static bundle size report
npm run bundle-size
```

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

#### Setup
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

#### Configuration (`vercel.json`)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://browser.sentry-cdn.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.sentry.io https://fruity-proxy.vercel.app;"
        }
      ]
    }
  ]
}
```

### Option 2: Netlify

#### Setup
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod --dir=build
```

#### Configuration (`netlify.toml`)
```toml
[build]
  publish = "build"
  command = "npm run build"

[build.environment]
  NODE_ENV = "production"
  GENERATE_SOURCEMAP = "false"

[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://browser.sentry-cdn.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.sentry.io https://fruity-proxy.vercel.app;"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Option 3: AWS S3 + CloudFront

#### Setup
```bash
# Install AWS CLI
pip install awscli

# Configure AWS credentials
aws configure

# Create S3 bucket
aws s3 mb s3://your-app-bucket

# Upload build files
aws s3 sync build/ s3://your-app-bucket --delete

# Create CloudFront distribution
aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
```

## 🔧 Environment Variables

### Required Variables
```bash
# API Configuration
REACT_APP_API_BASE_URL=https://fruity-proxy.vercel.app
REACT_APP_API_PASSWORD=takehome
REACT_APP_API_KEY=fruit-api-challenge-2025

# Monitoring
REACT_APP_SENTRY_DSN=your-sentry-dsn
REACT_APP_RUM_ENDPOINT=https://your-rum-endpoint.com

# Feature Flags
REACT_APP_ENABLE_SERVICE_WORKER=true
REACT_APP_ENABLE_RUM=true
REACT_APP_ENABLE_SENTRY=true
```

### Optional Variables
```bash
# Performance
REACT_APP_BUNDLE_ANALYZER=false
REACT_APP_ENABLE_DEBUG=false

# Analytics
REACT_APP_GA_TRACKING_ID=your-ga-id
REACT_APP_HOTJAR_ID=your-hotjar-id
```

## 📊 Performance Monitoring

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Bundle Size Targets
- **Total Bundle**: < 500KB
- **Initial Bundle**: < 250KB
- **Chunk Size**: < 100KB

### Performance Budget
```json
{
  "budgets": [
    {
      "type": "initial",
      "maximumWarning": "250kb",
      "maximumError": "500kb"
    },
    {
      "type": "anyComponentStyle",
      "maximumWarning": "2kb",
      "maximumError": "4kb"
    }
  ]
}
```

## 🔒 Security Configuration

### Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://browser.sentry-cdn.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://api.sentry.io https://fruity-proxy.vercel.app;
  font-src 'self' data:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
">
```

### Security Headers
```nginx
# Nginx configuration
add_header X-Content-Type-Options nosniff;
add_header X-Frame-Options DENY;
add_header X-XSS-Protection "1; mode=block";
add_header Referrer-Policy "strict-origin-when-cross-origin";
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://browser.sentry-cdn.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.sentry.io https://fruity-proxy.vercel.app;";
```

## 📈 Monitoring Setup

### Sentry Configuration
```typescript
// src/utils/sentry.ts
Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: process.env.REACT_APP_VERSION,
  tracesSampleRate: 0.1,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
});
```

### RUM Configuration
```typescript
// src/utils/rum.ts
const rumConfig = {
  endpoint: process.env.REACT_APP_RUM_ENDPOINT,
  sampleRate: 0.1,
  enableDebug: process.env.NODE_ENV === 'development',
};
```

## 🚨 Error Handling

### Global Error Boundary
```typescript
// App.tsx
<ErrorBoundary
  onError={(error, errorInfo) => {
    sentryManager.captureException(error, {
      component: 'App',
      errorInfo,
    });
  }}
>
  <App />
</ErrorBoundary>
```

### API Error Handling
```typescript
// Retry logic with exponential backoff
const retryConfig = {
  retries: 3,
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  retryCondition: (error: any) => !error.message.includes('4'),
};
```

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm test -- --coverage --watchAll=false
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## 📊 Post-Deployment Checklist

### ✅ Performance
- [ ] Core Web Vitals within targets
- [ ] Bundle size acceptable
- [ ] Load time < 3 seconds
- [ ] Service worker registered
- [ ] Offline functionality working

### ✅ Functionality
- [ ] All features working
- [ ] API calls successful
- [ ] Error handling working
- [ ] Monitoring active
- [ ] Analytics tracking

### ✅ Security
- [ ] HTTPS enforced
- [ ] Security headers present
- [ ] CSP working
- [ ] No console errors
- [ ] No mixed content

### ✅ Monitoring
- [ ] Sentry error tracking
- [ ] RUM performance monitoring
- [ ] Service worker active
- [ ] Cache working
- [ ] Background sync enabled

## 🆘 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Performance Issues
```bash
# Analyze bundle
npm run analyze

# Check for memory leaks
npm run test:coverage
```

#### Deployment Issues
```bash
# Check environment variables
echo $NODE_ENV
echo $REACT_APP_SENTRY_DSN

# Verify build output
ls -la build/
```

## 📞 Support

For deployment issues:
1. Check the troubleshooting section
2. Review error logs in Sentry
3. Verify environment configuration
4. Test locally with production build
5. Contact the development team

---

**Remember**: Always test in a staging environment before deploying to production! 