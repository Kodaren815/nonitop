# Netlify Deployment Guide

## ✅ Pre-Deployment Checklist

### 1. Environment Variables (Set in Netlify Dashboard)
Go to Site Settings > Environment Variables and add:

```
STRIPE_SECRET_KEY=sk_live_YOUR_ACTUAL_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_ACTUAL_KEY
NEXT_PUBLIC_SITE_URL=https://your-domain.netlify.app
```

⚠️ **IMPORTANT**: 
- Use your LIVE Stripe keys for production
- Update `NEXT_PUBLIC_SITE_URL` with your actual Netlify URL after first deployment

### 2. Build Settings
These are already configured in `netlify.toml`:
- Build command: `npm run build`
- Publish directory: `.next`
- Node version: `20`
- Plugin: `@netlify/plugin-nextjs` (auto-installed)

### 3. Files Ready for Deployment

✅ **Configuration Files**
- `netlify.toml` - Netlify configuration
- `next.config.js` - Next.js configuration with standalone output
- `.env.example` - Environment variables template

✅ **Security**
- Middleware with rate limiting
- Input validation and sanitization
- Security headers configured
- CSP headers enabled

✅ **Performance**
- Image optimization enabled (AVIF/WebP)
- Compression enabled
- 30-day cache for images
- Lazy loading for images

✅ **SEO**
- Sitemap.xml generated dynamically
- Robots.txt configured
- Meta tags and OpenGraph
- JSON-LD structured data

## 🚀 Deployment Steps

### First-Time Deployment

1. **Push to Git**
   ```bash
   git add .
   git commit -m "Ready for production"
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to https://app.netlify.com
   - Click "Add new site" > "Import an existing project"
   - Connect to your Git repository
   - Select the repository

3. **Configure Build Settings** (if not auto-detected)
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Base directory: (leave empty)

4. **Set Environment Variables**
   - Go to Site settings > Environment variables
   - Add the three variables listed above

5. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete (~2-3 minutes)

6. **Update Site URL**
   - After first deployment, copy your Netlify URL
   - Update `NEXT_PUBLIC_SITE_URL` environment variable
   - Trigger a new deploy

### Subsequent Deployments

Simply push to your Git repository - Netlify will auto-deploy:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

## 🔧 Post-Deployment

### 1. Test Your Site
- [ ] Homepage loads correctly
- [ ] All product pages work
- [ ] Fabric selection works
- [ ] Add to cart functionality
- [ ] Checkout redirects to Stripe
- [ ] Images load properly
- [ ] Mobile responsive

### 2. Update Stripe Webhooks (Optional)
If you want to receive Stripe webhooks:
1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://your-domain.netlify.app/api/webhook`
3. Select events you want to receive

### 3. Custom Domain (Optional)
1. Go to Site settings > Domain management
2. Click "Add custom domain"
3. Follow instructions to configure DNS

## 📝 Important Notes

### Hardcoded Products
All products are now hardcoded in `/lib/products.ts`. To add/edit products:
1. Edit `/lib/products.ts`
2. Commit and push changes
3. Netlify will auto-deploy

### Stripe Integration
- Checkout creates Stripe sessions
- Customer notes are passed to Stripe metadata
- Supports Klarna and card payments
- Free shipping calculated automatically

### Security Features
- Rate limiting (100 requests/minute)
- Input sanitization
- XSS protection
- CSRF protection via middleware
- Secure headers

## 🆘 Troubleshooting

### Build Fails
- Check build logs in Netlify dashboard
- Verify all dependencies are in package.json
- Ensure Node version is 20

### Environment Variables Not Working
- Make sure variables don't have quotes in Netlify
- Variables starting with `NEXT_PUBLIC_` are client-side
- Redeploy after changing environment variables

### Images Not Loading
- Check image URLs in browser console
- Verify remote image domains in next.config.js
- Check image file paths are correct

### Checkout Not Working
- Verify Stripe keys are correct
- Check Stripe dashboard for errors
- Ensure NEXT_PUBLIC_SITE_URL is set correctly

## 📧 Support
If you encounter issues, check:
1. Netlify build logs
2. Browser console errors
3. Stripe dashboard logs

---

**You're all set! 🎉**
