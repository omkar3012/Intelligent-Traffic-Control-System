# Vercel Deployment Guide

This document provides step-by-step instructions on how to deploy the Intelligent Traffic Control System application to Vercel.

## Step 1: Prepare Your Project for Deployment

Before deploying, ensure your project is configured correctly for Vercel's environment.

### 1.1. API Route Configuration

The API route that handles video processing needs to be adjusted for Vercel's serverless environment.

- **File Uploads**: Vercel's serverless functions have a read-only filesystem, except for the `/tmp` directory. The `app/api/process-intersection/route.ts` file has been updated to use this directory for temporary file storage.
- **Python Runtime**: The API route has also been updated to use the standard `python` command, as Vercel manages the Python runtime environment automatically.

### 1.2. Vercel Configuration (`vercel.json`)

The `vercel.json` file is configured to optimize the serverless function for the Python script:

```json
{
  "functions": {
    "app/api/process-intersection/route.ts": {
      "maxDuration": 300,
      "memory": 3008
    }
  }
}
```

- `maxDuration`: Sets the timeout for the function to 300 seconds (5 minutes) to allow for video processing.
- `memory`: Allocates 3008 MB of memory to the function to handle the resource needs of the script.

### 1.3. Python Dependencies (`requirements.txt`)

The `requirements.txt` file is cleaned up to only include the necessary package for the simplified detection script:

```
opencv-python
```

## Step 2: Push Your Code to a Git Repository

Vercel deploys directly from a Git provider like GitHub, GitLab, or Bitbucket.

1.  **Initialize Git**: If you haven't already, initialize a git repository in your project folder.
    ```bash
    git init
    ```
2.  **Commit Your Changes**: Add all your project files and commit them.
    ```bash
    git add .
    git commit -m "Finalize project for Vercel deployment"
    ```
3.  **Create a GitHub Repository**: Go to [GitHub](https://github.com/new) and create a new repository.
4.  **Push Your Code**: Follow the instructions on GitHub to push your local repository to the remote one.
    ```bash
    git remote add origin <your-github-repo-url>
    git branch -M main
    git push -u origin main
    ```

## Step 3: Deploy on Vercel

1.  **Sign up/Log in to Vercel**: Go to [vercel.com](https://vercel.com) and sign up or log in with your Git provider account.
2.  **Import Project**:
    - On your Vercel dashboard, click "**Add New...**" -> "**Project**".
    - Select the Git repository you just created.
3.  **Configure Project**:
    - Vercel will automatically detect that this is a Next.js project. The default settings should be correct.
    - No environment variables are needed for this project.
4.  **Deploy**: Click the "**Deploy**" button.

Vercel will now build and deploy your application. Once complete, you will be provided with a public URL to your live project.

## 🔧 Pre-deployment Setup

### 1. Environment Variables

Create a `.env.local` file for local development:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_NAME=Intelligent Traffic Control System
```

For production, add these in Vercel dashboard:
- Go to Project Settings → Environment Variables
- Add the same variables with production values

### 2. Python Dependencies

Ensure your `requirements.txt` is up to date:
```bash
pip freeze > requirements.txt
```

### 3. Model Files

Make sure YOLOv2 weights are available:
```
bin/
└── yolov2.weights  # Download if not present
```

## 🌐 Platform-Specific Deployment

### Vercel (Recommended)

**Advantages:**
- Automatic Next.js optimization
- Serverless functions for Python API
- Global CDN
- Easy environment variable management

**Configuration:**
- `vercel.json` is already configured
- Python functions have 300-second timeout
- File uploads are handled via serverless functions

### Netlify

1. **Build Command**:
   ```bash
   npm run build
   ```

2. **Publish Directory**:
   ```
   .next
   ```

3. **Environment Variables**:
   - Add in Netlify dashboard
   - Note: Python backend needs separate hosting

### Railway

1. **Create `railway.json`**:
   ```json
   {
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "npm start",
       "healthcheckPath": "/",
       "healthcheckTimeout": 100,
       "restartPolicyType": "ON_FAILURE"
     }
   }
   ```

2. **Deploy**:
   ```bash
   railway login
   railway init
   railway up
   ```

### Docker Deployment

1. **Create `Dockerfile`**:
   ```dockerfile
   FROM node:18-alpine
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm ci --only=production
   
   COPY . .
   RUN npm run build
   
   EXPOSE 3000
   
   CMD ["npm", "start"]
   ```

2. **Build and Run**:
   ```bash
   docker build -t traffic-control .
   docker run -p 3000:3000 traffic-control
   ```

## 🔍 Post-Deployment Verification

### 1. Health Check

Visit your deployed URL and verify:
- ✅ Homepage loads
- ✅ File upload interface works
- ✅ API endpoints respond
- ✅ Python processing functions

### 2. API Testing

Test the processing endpoint:
```bash
curl -X POST https://your-app.vercel.app/api/process-traffic \
  -F "file=@test_image.jpg"
```

### 3. Performance Check

- Page load times < 3 seconds
- API response times < 10 seconds
- File uploads work correctly

## 🛠️ Troubleshooting

### Common Issues

#### 1. Python Dependencies Not Found
**Error**: `ModuleNotFoundError: No module named 'opencv'`

**Solution**:
```bash
# Ensure requirements.txt is in root
pip install -r requirements.txt
```

#### 2. YOLOv2 Weights Missing
**Error**: `FileNotFoundError: ./bin/yolov2.weights`

**Solution**:
- Download YOLOv2 weights to `bin/` directory
- Or use mock detection for testing

#### 3. File Upload Size Limits
**Error**: `Payload too large`

**Solution**:
- Update `vercel.json` to increase function timeout
- Consider chunked uploads for large files

#### 4. CORS Issues
**Error**: `Access to fetch at '...' from origin '...' has been blocked`

**Solution**:
- Check `next.config.js` CORS settings
- Verify API route headers

### Performance Optimization

#### 1. Image Optimization
```javascript
// In next.config.js
module.exports = {
  images: {
    domains: ['your-domain.com'],
    formats: ['image/webp', 'image/avif'],
  }
}
```

#### 2. Bundle Analysis
```bash
npm install --save-dev @next/bundle-analyzer
```

#### 3. Caching Strategy
```javascript
// In API routes
export async function GET() {
  return new Response(data, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
```

## 📊 Monitoring

### Vercel Analytics

1. **Enable Analytics**:
   - Go to Project Settings → Analytics
   - Enable Web Analytics

2. **Monitor**:
   - Page views and performance
   - API function execution times
   - Error rates

### Custom Monitoring

Add monitoring to your API routes:
```javascript
// In API routes
export async function POST(request) {
  const startTime = Date.now()
  
  try {
    // Your processing logic
    const result = await processFile(request)
    
    // Log performance
    console.log(`Processing time: ${Date.now() - startTime}ms`)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Processing error:', error)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}
```

## 🔒 Security Considerations

### 1. File Upload Security
```javascript
// Validate file types
const allowedTypes = ['video/mp4', 'image/jpeg', 'image/png']
if (!allowedTypes.includes(file.type)) {
  return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
}
```

### 2. Environment Variables
- Never commit sensitive data
- Use Vercel's environment variable system
- Rotate API keys regularly

### 3. Rate Limiting
Consider implementing rate limiting for API endpoints:
```javascript
// Add rate limiting middleware
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})
```

## 📈 Scaling Considerations

### 1. Database Integration
For production use, consider adding a database:
- **PostgreSQL** for structured data
- **MongoDB** for flexible schemas
- **Redis** for caching

### 2. File Storage
For large files, use cloud storage:
- **AWS S3** for file storage
- **Cloudinary** for image processing
- **Vercel Blob** for simple file storage

### 3. Background Processing
For heavy processing:
- **Vercel Cron Jobs** for scheduled tasks
- **AWS Lambda** for serverless processing
- **Redis Queue** for job queuing

## 🎯 Production Checklist

- [ ] Environment variables configured
- [ ] Python dependencies installed
- [ ] YOLOv2 weights available
- [ ] File upload limits set
- [ ] CORS configured
- [ ] Error handling implemented
- [ ] Performance monitoring enabled
- [ ] Security measures in place
- [ ] Backup strategy defined
- [ ] Documentation updated

## 📞 Support

For deployment issues:
1. Check Vercel logs in dashboard
2. Review error messages in browser console
3. Test locally with `npm run dev`
4. Create issue in GitHub repository

---

**Happy Deploying! 🚀** 