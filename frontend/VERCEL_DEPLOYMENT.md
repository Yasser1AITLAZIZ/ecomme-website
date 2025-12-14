# Vercel Deployment Guide

This guide will help you deploy your Next.js e-commerce website to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. Your project pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Import Your Project**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Git Repository"
   - Select your repository
   - Vercel will automatically detect it's a Next.js project

2. **Configure Project Settings**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

3. **Environment Variables**
   - Click "Environment Variables"
   - Add the following variables:
     ```
     NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
     ```
   - Replace with your actual API URL for production

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete
   - Your site will be live at `your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   - Follow the prompts
   - For production deployment, use:
     ```bash
     vercel --prod
     ```

## Environment Variables

Set these in your Vercel project settings:

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Your backend API URL | `https://api.example.com/api` |

## Project Configuration

The project is already configured for Vercel with:

- ✅ `vercel.json` - Deployment configuration
- ✅ `next.config.js` - Optimized for production
- ✅ `.gitignore` - Includes `.vercel` directory
- ✅ Proper Next.js App Router structure
- ✅ TypeScript configuration

## Build Optimization

The project includes:

- **Image Optimization**: Configured for AVIF and WebP formats
- **SWC Minification**: Enabled for faster builds
- **Package Optimization**: Optimized imports for `lucide-react` and `framer-motion`
- **Caching Headers**: Configured in `vercel.json` for static assets

## Custom Domain

1. Go to your project settings in Vercel
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## Monitoring & Analytics

Vercel provides built-in:
- Real-time analytics
- Performance monitoring
- Error tracking
- Web Vitals

Access these in your Vercel dashboard.

## Troubleshooting

### Build Fails

1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Verify Node.js version (should be 18+)
4. Check for TypeScript errors locally:
   ```bash
   npm run build
   ```

### Environment Variables Not Working

- Ensure variables start with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding new environment variables
- Check variable names match exactly (case-sensitive)

### Images Not Loading

- Verify `next.config.js` has correct `remotePatterns`
- Check image URLs are accessible
- Ensure images are served over HTTPS in production

## Continuous Deployment

Vercel automatically deploys:
- **Production**: Every push to `main` or `master` branch
- **Preview**: Every push to other branches (creates preview URLs)

## Performance Tips

1. **Enable Edge Functions** (if needed) in `vercel.json`
2. **Use Image Optimization** - Already configured
3. **Enable Analytics** - Available in Vercel dashboard
4. **Monitor Bundle Size** - Check build output

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Support](https://vercel.com/support)

