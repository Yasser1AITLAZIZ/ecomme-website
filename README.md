# TechStore - E-commerce Frontend

A sophisticated, animated e-commerce frontend for iPhone and phone accessories built with Next.js, featuring dynamic scroll animations, 3D product showcases, and a complete shopping experience.

## Features

- 🎨 **Sophisticated Design**: Black and gold color palette with modern UI
- ✨ **Dynamic Animations**: Scroll-triggered animations using Framer Motion
- 📱 **3D Product Showcases**: Interactive 3D iPhone models using Three.js
- 🛒 **Shopping Cart**: Full cart functionality with persistent storage
- 👤 **User Authentication**: Login, register, and protected routes
- 📦 **Order Management**: Order history and tracking
- 🎯 **Product Catalog**: Browse by category with search and filters
- 💳 **Checkout Flow**: Complete checkout process (without payment processing)

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **3D Graphics**: Three.js, React Three Fiber
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **API**: Axios with mock data (ready for backend integration)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes
│   ├── (shop)/            # Shopping routes
│   ├── account/           # User account pages
│   └── page.tsx           # Home page
├── components/
│   ├── animations/        # Animation components
│   ├── auth/              # Authentication forms
│   ├── layout/            # Header, Footer, CartSidebar
│   ├── product/           # Product components
│   └── ui/                # Reusable UI components
├── lib/
│   ├── api/               # API service layer
│   ├── store/             # Zustand stores
│   └── utils/              # Utility functions
└── types/                  # TypeScript types
```

## Demo Credentials

- Email: `demo@example.com`
- Password: `demo123`

## API Integration

The project includes a mock API layer that can be easily replaced with real backend endpoints. Update the API base URL in `src/lib/api/client.ts` and replace mock implementations in the API files.

## Features in Detail

### Animations
- Scroll-triggered fade-in and slide-up animations
- Parallax scrolling effects
- 3D iPhone rotation on scroll
- Smooth page transitions
- Micro-interactions on buttons and cards

### Shopping Experience
- Product browsing with category filters
- Product detail pages with image galleries
- Shopping cart with quantity management
- Persistent cart storage
- Order placement and tracking

### User Account
- User registration and login
- Profile management
- Order history
- Protected routes

## Development

### Build for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Environment Variables

Create a `.env.local` file for environment variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Future Enhancements

- Payment integration
- Wishlist functionality
- Product reviews and ratings
- Advanced search and filters
- Email notifications
- Admin dashboard

## License

This project is private and proprietary.

