# E-commerce Website

Application e-commerce moderne avec Next.js (frontend) et FastAPI (backend).

## Architecture

- **Frontend**: Next.js 14 avec TypeScript
- **Backend**: FastAPI (Python)
- **Database**: Supabase (PostgreSQL)
- **Reverse Proxy**: Nginx
- **Containerization**: Docker & Docker Compose

## DÃ©ploiement avec Docker

### Option 1: Utiliser les images Docker Hub (RecommandÃ© pour production)

1. Publier les images sur Docker Hub (voir `DOCKER_BUILD.md`):
```bash
# Se connecter Ã  Docker Hub
docker login

# Build et push les images
./build-and-push.sh latest yourusername
# Ou sur Windows:
.\build-and-push.ps1 -Version latest -DockerHubUsername yourusername
```

2. Sur le VPS, cloner le repository et configurer:
```bash
git clone <your-repo-url>
cd ecomme-website
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp .env.example .env
```

3. Ã‰diter `.env` et ajouter:
```bash
DOCKERHUB_USERNAME=yourusername
IMAGE_TAG=latest
```

4. Pull et dÃ©marrer depuis Docker Hub:
```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

### Option 2: Build local (DÃ©veloppement)

1. Cloner le repository:
```bash
git clone <your-repo-url>
cd ecomme-website
```

2. Configurer les variables d'environnement:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp .env.example .env
```

3. Ã‰diter les fichiers .env avec vos valeurs

4. Build et dÃ©marrer:
```bash
docker compose build
docker compose up -d
```

### VÃ©rification

- Backend API: http://localhost:8000/health
- Frontend: http://localhost:3000
- Nginx: http://localhost
- API Docs: http://localhost:8000/docs

### Commandes utiles

```bash
# Voir les logs
docker compose logs -f

# RedÃ©marrer un service
docker compose restart backend

# ArrÃªter les services
docker compose down

# Rebuild et redÃ©marrer
docker compose up -d --build
```

## Documentation

- **VPS_SETUP.md**: Guide complet de setup VPS Ubuntu 24.02 avec commandes Linux
- **DOCKER_BUILD.md**: Guide pour build et publier les images Docker sur Docker Hub

## DÃ©veloppement local

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Structure du projet

```
.
â”œâ”€â”€ backend/          # API FastAPI
â”œâ”€â”€ frontend/         # Application Next.js
â”œâ”€â”€ nginx/            # Configuration Nginx
â”œâ”€â”€ docker-compose.yml # Orchestration Docker (build local)
â”œâ”€â”€ docker-compose.prod.yml # Orchestration Docker (images Docker Hub)
â””â”€â”€ docs/             # Documentation

```

## Technologies

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: FastAPI, Python, Pydantic
- **Database**: Supabase (PostgreSQL)
- **Payment**: Stripe
- **Containerization**: Docker, Docker Compose

## Licence

[Votre licence ici]
