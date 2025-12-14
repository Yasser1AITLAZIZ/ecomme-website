# E-commerce Platform

Complete e-commerce platform with Next.js frontend and FastAPI backend.

## Project Structure

```
ecomme-website/
├── frontend/          # Next.js frontend application
├── backend/           # FastAPI backend application
└── README.md          # This file
```

## Quick Start

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your Supabase credentials
uvicorn app.main:app --reload
```

The backend API will be available at `http://localhost:8000`
API documentation: `http://localhost:8000/docs`

## Development

### Frontend Development

See `frontend/README.md` for frontend-specific documentation.

### Backend Development

See `backend/README.md` for backend-specific documentation.

## Deployment

### Frontend (Vercel)

The frontend is configured for Vercel deployment. See `frontend/vercel.json` for configuration.

### Backend

The backend can be deployed to any platform supporting Python/FastAPI:
- Railway
- Render
- AWS
- Google Cloud
- Azure

See `backend/README.md` for deployment instructions.

## Environment Variables

### Frontend

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Backend

See `backend/.env.example` for all required environment variables.

## License

Private project
