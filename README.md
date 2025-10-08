# ACM@SJSU Website

This is the official website for ACM@SJSU. It serves as the hub for showcasing our events, projects, and members.

##  Tech Stack
- **Frontend**: Vite + React + Typescript + Tailwind CSS
- **Backend**: Hono.js
- **Database**: PostgreSQL
- **Deployment**: Docker + Nginx + AWS

## Getting Started

### Clone the Repository
```sh
git clone https://github.com/SJSUCSClub/acm-website-server.git
cd acm-website-server
```

### Setup the Environment
```sh
cp .env.example .env.local
```

### Start the Development Server
```sh
docker compose -f docker-compose.dev.yml --env-file .env.local up --build
```
Open http://localhost
