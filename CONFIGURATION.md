# Configuration Guide

This guide covers how to configure the Intelligent Traffic Control System for production deployment with Google Vision API.

## Prerequisites

1. **Google Cloud Account** with Vision API enabled
2. **Vercel Account** for frontend deployment
3. **Render Account** for backend deployment

## Google Vision API Setup

### 1. Enable Google Vision API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable the **Cloud Vision API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Cloud Vision API"
   - Click "Enable"

### 2. Create API Key

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key
4. **Restrict the API Key** (recommended):
   - Click on the API key to edit
   - Under "API restrictions", select "Restrict key"
   - Choose "Cloud Vision API"
   - Save changes

### 3. Set Usage Quotas (Optional)

1. Go to "APIs & Services" > "Quotas"
2. Find "Cloud Vision API"
3. Set appropriate limits to control costs

## Environment Variables

### Backend Environment Variables (Render)

Set these in your Render service dashboard:

```
GOOGLE_VISION_API_KEY=your_actual_api_key_here
FRONTEND_URL=https://your-app.vercel.app
FRONTEND_URL_LOCAL=http://localhost:3000
PORT=8000
HOST=0.0.0.0
ENVIRONMENT=production
```

### Frontend Environment Variables (Vercel)

Set these in your Vercel project settings:

```
BACKEND_URL=https://your-backend.onrender.com
NEXT_PUBLIC_APP_NAME=Intelligent Traffic Control System
```

## Deployment Configuration

### Backend Deployment (Render)

1. **Connect Repository**: Link your GitHub repository
2. **Build Command**: `pip install -r backend/requirements.txt`
3. **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. **Root Directory**: `backend`
5. **Environment**: Python 3.11+

### Frontend Deployment (Vercel)

1. **Connect Repository**: Link your GitHub repository  
2. **Framework Preset**: Next.js
3. **Root Directory**: Leave empty (auto-detected)
4. **Build Command**: `npm run build` (auto-detected)
5. **Output Directory**: `.next` (auto-detected)

### Update CORS Origins

After deployment, update the CORS origins in `backend/main.py`:

```python
origins = [
    "https://your-actual-domain.vercel.app",
    "http://localhost:3000",  # Keep for local development
]
```

## Google Vision API Usage & Costs

### Free Tier Limits
- **1,000 requests per month** - completely free
- Perfect for demo and light production use

### Pricing (if you exceed free tier)
- **$1.50 per 1,000 requests** after free tier
- Very reasonable for production traffic systems

### Cost Optimization Tips
1. **Cache Results**: Store vehicle counts for similar images
2. **Resize Images**: Smaller images = faster processing
3. **Batch Processing**: Process multiple lanes efficiently
4. **Set Request Limits**: Prevent unexpected usage spikes

## Testing the Integration

### Local Testing

1. **Start Backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   export GOOGLE_VISION_API_KEY=your_key_here
   uvicorn main:app --reload
   ```

2. **Start Frontend**:
   ```bash
   export BACKEND_URL=http://localhost:8000
   npm run dev
   ```

3. **Test Health Check**:
   ```bash
   curl http://localhost:8000/health
   ```

### Production Testing

1. **Health Check**: `https://your-backend.onrender.com/health`
2. **Frontend**: Upload test traffic images
3. **Monitor Logs**: Check both Render and Vercel logs

## Security Best Practices

### API Key Security
- **Never commit API keys** to version control
- **Use environment variables** only
- **Restrict API key** to specific APIs
- **Rotate keys regularly**

### CORS Configuration
- **Specify exact domains** instead of wildcards
- **Remove localhost** origins in production
- **Use HTTPS only** in production

### Rate Limiting
Consider implementing rate limiting to prevent abuse:
```python
# Add to backend if needed
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post('/process-video')
@limiter.limit("10/minute")  # Limit to 10 requests per minute
async def process_images(request: Request):
    # ... existing code
```

## Monitoring & Maintenance

### Key Metrics to Monitor
- **API Request Count**: Stay within free limits
- **Response Times**: Should be < 5 seconds
- **Error Rates**: Should be < 1%
- **Detection Accuracy**: Review vehicle counts

### Log Monitoring
- **Backend Logs**: Monitor in Render dashboard
- **Frontend Logs**: Monitor in Vercel dashboard
- **API Usage**: Monitor in Google Cloud Console

### Backup Plan
If Google Vision API is unavailable:
1. **Graceful Degradation**: Return estimated counts
2. **Queue Requests**: Retry failed requests
3. **Alternative APIs**: Consider Azure Computer Vision as backup

## Troubleshooting

### Common Issues

#### "API key not configured"
- Check environment variable is set correctly
- Verify API key is valid in Google Cloud Console

#### "API request failed: 403"
- Check API key restrictions
- Verify Cloud Vision API is enabled
- Check billing account is active

#### "CORS policy error"
- Update CORS origins in backend
- Check frontend URL matches CORS settings

#### "Backend API error: 500"
- Check backend logs in Render
- Verify all environment variables are set
- Test API key with curl/Postman

### Getting Help
1. **Check Logs**: Always check both frontend and backend logs
2. **Test Locally**: Reproduce issues in local environment
3. **Google Cloud Support**: For API-specific issues
4. **GitHub Issues**: For application-specific problems

---

**Ready for Production!** 🚀

Your traffic control system now uses professional-grade Google Vision API for accurate vehicle detection instead of mock data. 