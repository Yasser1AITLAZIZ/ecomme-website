# Project Structure

This document describes the structure of the e-commerce platform.

## Root Structure

```
ecomme-website/
├── frontend/              # Next.js frontend application
├── backend/               # FastAPI backend application
├── .gitignore            # Git ignore rules for both projects
├── README.md             # Main project README
└── PROJECT_STRUCTURE.md  # This file
```

## Frontend Structure

```
frontend/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── (auth)/       # Authentication routes
│   │   ├── (shop)/       # Shopping routes
│   │   ├── account/      # User account pages
│   │   └── ...
│   ├── components/        # React components
│   │   ├── animations/   # Animation components
│   │   ├── auth/         # Auth components
│   │   ├── layout/       # Layout components
│   │   ├── product/      # Product components
│   │   └── ui/           # UI components
│   ├── lib/              # Utilities and libraries
│   │   ├── api/          # API client functions
│   │   ├── i18n/         # Internationalization
│   │   ├── store/        # Zustand stores
│   │   └── utils/        # Utility functions
│   └── types/            # TypeScript type definitions
├── public/               # Static assets
├── package.json          # Node.js dependencies
├── next.config.js        # Next.js configuration
├── tailwind.config.ts    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── vercel.json           # Vercel deployment configuration
```

## Backend Structure

```
backend/
├── app/
│   ├── api/              # API routes
│   │   ├── v1/           # API version 1
│   │   │   └── routes/   # Route handlers
│   │   └── health.py     # Health check endpoints
│   ├── core/             # Core utilities
│   │   ├── security.py   # Security utilities
│   │   ├── logging.py    # Logging configuration
│   │   ├── permissions.py # RBAC
│   │   └── ...
│   ├── middleware/        # Middleware components
│   │   ├── security.py   # Security middleware
│   │   ├── error_handler.py # Error handling
│   │   └── ...
│   ├── schemas/          # Pydantic schemas
│   ├── services/         # Business logic services
│   ├── config.py         # Configuration
│   ├── database.py      # Database client
│   └── main.py          # FastAPI app entry point
├── supabase/
│   ├── migrations/       # Database migrations
│   └── functions/        # Supabase Edge Functions
├── tests/                # Test suite
├── scripts/              # Utility scripts
├── requirements.txt      # Python dependencies
└── README.md            # Backend documentation
```

## Development Workflow

### Frontend Development

1. Navigate to `frontend/` directory
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev`
4. Access at `http://localhost:3000`

### Backend Development

1. Navigate to `backend/` directory
2. Create virtual environment: `python -m venv venv`
3. Activate virtual environment
4. Install dependencies: `pip install -r requirements.txt`
5. Configure `.env` file
6. Start server: `uvicorn app.main:app --reload`
7. Access API docs at `http://localhost:8000/docs`

## Deployment

### Frontend

- Deployed to Vercel
- Configuration in `frontend/vercel.json`
- Environment variables set in Vercel dashboard

### Backend

- Can be deployed to:
  - Railway
  - Render
  - AWS
  - Google Cloud
  - Azure
- See `backend/README.md` for deployment instructions

## Environment Variables

### Frontend

Set in Vercel dashboard or `frontend/.env.local`:
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Backend

Set in deployment platform or `backend/.env`:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET`
- `STRIPE_SECRET_KEY`
- And more (see `backend/.env.example`)

