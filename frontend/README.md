# E-commerce Frontend

Next.js frontend application for the e-commerce platform.

## Features

- Modern UI with Tailwind CSS
- 3D product visualizations with Three.js
- Internationalization (i18n)
- Shopping cart management
- User authentication
- Product browsing and search
- Checkout flow
- Order management

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/        # React components
│   ├── lib/              # Utilities and API clients
│   └── types/            # TypeScript types
├── public/               # Static assets
└── package.json
```

## Tech Stack

- **Framework**: Next.js 14
- **UI**: Tailwind CSS
- **3D**: Three.js, React Three Fiber
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Animations**: Framer Motion

## Deployment

The frontend is configured for Vercel deployment. See `vercel.json` for configuration.

