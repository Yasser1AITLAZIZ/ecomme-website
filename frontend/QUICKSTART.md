# Quick Start Guide

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

## Demo Account

- **Email**: demo@example.com
- **Password**: demo123

## Key Features Implemented

✅ **Home Page**
- Hero section with 3D iPhone animation
- Scroll-triggered animations
- Featured products section
- Category navigation

✅ **Product Pages**
- Product listing with filters and search
- Product detail pages with image gallery
- 360° product view capability

✅ **Shopping Cart**
- Add/remove items
- Quantity management
- Persistent cart storage
- Cart sidebar

✅ **Checkout**
- Shipping information form
- Order validation
- Order confirmation

✅ **Authentication**
- User registration
- User login
- Protected routes

✅ **User Account**
- Account dashboard
- Order history
- Profile management

## Project Structure

- `src/app/` - Next.js pages (App Router)
- `src/components/` - React components
- `src/lib/` - Utilities, stores, API layer
- `src/types/` - TypeScript type definitions
- `public/` - Static assets

## Next Steps

1. Add product images to `public/images/`
2. Connect to your backend API (update `src/lib/api/`)
3. Configure environment variables
4. Deploy to production

## Notes

- All API calls use mock data for development
- Images are handled gracefully when missing
- Cart and auth state persist in localStorage
- Responsive design for all screen sizes

