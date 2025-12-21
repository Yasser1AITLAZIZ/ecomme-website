# Guide de Setup VPS Ubuntu 24.02

Ce guide contient toutes les commandes Linux nÃ©cessaires pour configurer un VPS Ubuntu 24.02 vierge avec Docker pour dÃ©ployer l'application e-commerce.

## PrÃ©requis

- VPS Ubuntu 24.02 avec accÃ¨s root ou sudo
- Docker dÃ©jÃ  installÃ© (ou instructions d'installation incluses)
- AccÃ¨s SSH au serveur

---

## 1. Mise Ã  jour du systÃ¨me

```bash
sudo apt update
sudo apt upgrade -y
sudo apt autoremove -y
sudo apt autoclean
```

---

## 2. Configuration de base

### 2.1 CrÃ©er un utilisateur non-root

```bash
sudo adduser deploy
sudo usermod -aG sudo deploy
sudo usermod -aG docker deploy
su - deploy
```

### 2.2 Configuration SSH

```bash
sudo nano /etc/ssh/sshd_config
# Modifier: PermitRootLogin no, PasswordAuthentication no
sudo systemctl restart sshd
```

### 2.3 Configuration du firewall (UFW)

```bash
sudo ufw enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw status verbose
```

---

## 3. Installation Docker (si non installÃ©)

### 3.1 Installer les dÃ©pendances

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg lsb-release
```

### 3.2 Ajouter la clÃ© GPG Docker

```bash
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
```

### 3.3 Configurer le dÃ©pÃ´t Docker

```bash
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
```

### 3.4 Installer Docker

```bash
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
docker --version
docker compose version
```

### 3.5 Configurer Docker pour utilisateur non-root

```bash
sudo usermod -aG docker $USER
newgrp docker
docker run hello-world
```

### 3.6 Activer Docker au dÃ©marrage

```bash
sudo systemctl enable docker
sudo systemctl start docker
sudo systemctl status docker
```

---

## 4. Configuration rÃ©seau

```bash
sudo netstat -tulpn | grep LISTEN
sudo apt install -y dnsutils
nslookup yourdomain.com
```

---


## 5. PrÃ©paration du dÃ©ploiement

### 5.1 Cloner le repository

```bash
sudo apt install -y git
cd ~
git clone https://github.com/yourusername/ecomme-website.git
cd ecomme-website
```

### 5.2 Configurer les fichiers .env

```bash
# CrÃ©er les fichiers .env Ã  partir des exemples
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp .env.example .env

# Ã‰diter les fichiers .env avec vos valeurs
nano backend/.env
nano frontend/.env
nano .env
```

### 5.3 Configurer Docker Hub (IMPORTANT)

```bash
# CrÃ©er un fichier .env pour docker-compose avec votre username Docker Hub
echo "DOCKERHUB_USERNAME=yourusername" >> .env
echo "IMAGE_TAG=latest" >> .env

# Ou Ã©diter manuellement
nano .env
# Ajouter:
# DOCKERHUB_USERNAME=yourusername
# IMAGE_TAG=latest
```

### 5.4 GÃ©nÃ©rer une clÃ© secrÃ¨te pour le backend

```bash
# GÃ©nÃ©rer une clÃ© secrÃ¨te alÃ©atoire
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# Ou avec OpenSSL
openssl rand -base64 32
```

### 5.5 Mettre Ã  jour la configuration Nginx avec votre domaine

```bash
# Ã‰diter la configuration Nginx
nano nginx/nginx.conf

# Remplacer "yourdomain.com" par votre domaine rÃ©el
# Remplacer "www.yourdomain.com" par votre sous-domaine www
```

---

## 6. DÃ©ploiement

### 6.1 Pull et dÃ©marrage des conteneurs depuis Docker Hub

```bash
# Utiliser docker-compose.prod.yml qui pull les images depuis Docker Hub
docker compose -f docker-compose.prod.yml pull

# DÃ©marrer les services en arriÃ¨re-plan
docker compose -f docker-compose.prod.yml up -d

# VÃ©rifier le statut des conteneurs
docker compose -f docker-compose.prod.yml ps
```

**Note**: Les images seront automatiquement pullÃ©es depuis Docker Hub. Assurez-vous que les images ont Ã©tÃ© publiÃ©es sur Docker Hub avant de dÃ©ployer.


### 6.1 Build et dÃ©marrage

```bash
docker compose build
docker compose up -d
docker compose ps
```

### 6.2 VÃ©rifier les logs

```bash
docker compose logs -f
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f nginx
```

### 6.3 VÃ©rifier la santÃ©

```bash
docker compose ps
curl http://localhost:8000/health
curl http://localhost:3000
curl http://localhost
```

---

## 7. Maintenance

### 7.1 Monitoring

```bash
docker stats
docker ps
docker system df
```

### 7.2 Gestion

```bash
docker compose down
docker compose restart backend
docker compose up -d --build
docker compose logs -f --tail=50
```

### 7.3 Mise Ã  jour

```bash
docker compose down
git pull origin main
docker compose build --no-cache
docker compose up -d
docker compose logs -f
```

### 7.4 Nettoyage

```bash
docker container prune -f
docker image prune -a -f
docker system prune -a --volumes -f
```

---

## 8. DÃ©pannage

```bash
sudo lsof -i :80
sudo lsof -i :8000
docker compose logs --tail=100 | grep -i error
sudo systemctl restart docker
df -h
free -h
```

---

## Notes importantes

1. Sauvegardes rÃ©guliÃ¨res des fichiers .env
2. Monitoring avec Prometheus/Grafana (optionnel)
3. Rotation des logs
4. Mises Ã  jour de sÃ©curitÃ© rÃ©guliÃ¨res
5. Configuration DNS correcte

---

## Support

En cas de problÃ¨me:
- Logs: `docker compose logs -f`
- Statut: `docker compose ps`
- Firewall: `sudo ufw status`
- Ressources: `docker stats`

