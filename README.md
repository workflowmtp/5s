# 5S Excellence & Suggestions

Application de suivi 5S et boîte à suggestions avec agent IA — **MULTIPRINT S.A.**

## Stack technique

- **Framework** : Next.js 15 (App Router, TypeScript)
- **Base de données** : PostgreSQL 16
- **ORM** : Prisma 6
- **Authentification** : NextAuth v5 (credentials)
- **UI** : Tailwind CSS + Recharts + Lucide Icons
- **State** : Zustand
- **IA** : Anthropic Claude API
- **Conteneurisation** : Docker Compose (PostgreSQL + pgAdmin)

## Architecture

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/    # NextAuth handler
│   │   ├── evaluations/           # CRUD évaluations 5S
│   │   ├── suggestions/           # CRUD suggestions
│   │   ├── actions/               # CRUD actions correctives
│   │   ├── users/                 # CRUD utilisateurs
│   │   ├── dashboard/             # Stats dashboard
│   │   ├── ai/
│   │   │   ├── chat/              # Chat conversationnel IA
│   │   │   └── analyze/           # Analyse IA (5S / suggestions)
│   │   └── admin/
│   │       ├── services/          # CRUD services
│   │       ├── ateliers/          # CRUD ateliers
│   │       ├── categories/        # CRUD catégories
│   │       └── export/            # Export CSV
│   ├── auth/login/                # Page de connexion
│   ├── dashboard/                 # Tableau de bord
│   ├── eval5s/                    # Module évaluation 5S
│   ├── suggestions/               # Module suggestions
│   ├── historique/                # Historique personnel
│   ├── classements/               # Classements & badges
│   ├── superviseur/               # Vue superviseur
│   ├── direction/                 # Vue direction
│   ├── admin/                     # Administration
│   ├── actions/                   # Actions correctives
│   ├── profil/                    # Profil utilisateur
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Redirect
│   └── globals.css                # Styles globaux
├── components/
│   ├── ui/                        # Composants réutilisables
│   ├── charts/                    # Composants graphiques
│   └── layout/                    # Layout (top bar, bottom nav)
├── lib/
│   ├── prisma.ts                  # Client Prisma singleton
│   ├── auth.ts                    # Configuration NextAuth
│   ├── constants.ts               # Constantes métier, scoring, RBAC
│   └── store.ts                   # Zustand stores
├── types/
│   └── index.ts                   # Types TypeScript
└── middleware.ts                   # Protection des routes
```

## Modèle de données (Prisma — 22 modèles)

| Modèle | Description |
|--------|-------------|
| User | Utilisateurs (matricule, rôle, service, atelier) |
| Service | Services / départements |
| Atelier | Zones d'évaluation |
| Evaluation | Évaluations 5S (5 piliers, scores, IA) |
| Suggestion | Suggestions (scoring 6 critères, workflow 11 statuts) |
| Categorie | Catégories de suggestions |
| Action | Actions correctives |
| Badge | Définition des badges |
| BadgeAttribue | Badges attribués aux utilisateurs |
| Photo | Photos / pièces jointes |
| Config | Configuration application (JSON) |
| Account / Session / VerificationToken | NextAuth |

## Installation

### 1. Prérequis

- Node.js 20+
- Docker & Docker Compose (pour PostgreSQL)
- npm ou pnpm

### 2. Cloner et installer

```bash
cd 5s-nextjs
npm install
```

### 3. Configuration environnement

```bash
cp .env.example .env
# Éditer .env avec vos paramètres :
# - DATABASE_URL (PostgreSQL)
# - NEXTAUTH_SECRET (générer avec: openssl rand -base64 32)
# - ANTHROPIC_API_KEY (optionnel, pour l'agent IA)
```

### 4. Lancer PostgreSQL

```bash
docker compose up -d
```

PostgreSQL sera accessible sur `localhost:5432`
pgAdmin sera accessible sur `localhost:5050` (admin@multiprint.cm / admin)

### 5. Initialiser la base de données

```bash
# Générer le client Prisma
npx prisma generate

# Créer les tables
npx prisma db push

# Seed avec données de démonstration
npx tsx prisma/seed.ts

# (Optionnel) Voir la base dans Prisma Studio
npx prisma studio
```

### 6. Lancer l'application

```bash
npm run dev
```

Ouvrir http://localhost:3000

### 7. Comptes de démonstration

| Matricule | Mot de passe | Rôle | Description |
|-----------|-------------|------|-------------|
| EMP001 | demo | Employé | Paul Nguyen — Opérateur |
| SUP001 | demo | Superviseur | David Nkoulou — Chef d'équipe |
| DIR001 | demo | Direction | Roger Tchoumi — Directeur d'usine |
| ADM001 | admin | Admin | Administrateur système |

## API Routes (27)

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | /api/auth/[...nextauth] | Authentification |
| GET/POST | /api/evaluations | Liste/Création évaluations |
| GET/PATCH/DELETE | /api/evaluations/[id] | Détail/Modification/Suppression |
| GET/POST | /api/suggestions | Liste/Création suggestions |
| GET/PATCH/DELETE | /api/suggestions/[id] | Détail/Modification/Suppression |
| GET/POST | /api/users | Liste/Création utilisateurs |
| PATCH | /api/users/[id] | Modification utilisateur |
| GET/POST | /api/actions | Liste/Création actions |
| PATCH | /api/actions/[id] | Modification action |
| GET | /api/dashboard | Statistiques dashboard |
| POST | /api/ai/chat | Chat IA conversationnel |
| POST | /api/ai/analyze | Analyse IA (5S/suggestion) |
| GET/POST | /api/admin/services | CRUD services |
| PATCH/DELETE | /api/admin/services/[id] | Modification/Suppression service |
| GET/POST | /api/admin/ateliers | CRUD ateliers |
| GET/POST | /api/admin/categories | CRUD catégories |
| GET | /api/admin/export | Export CSV |

## Scoring

### 5S (total /100)
- Seiri (Trier) : 20 pts
- Seiton (Ranger) : 20 pts
- Seiso (Nettoyer) : 20 pts
- Seiketsu (Standardiser) : 20 pts
- Shitsuke (Discipline) : 20 pts

### Suggestions (total /100)
- Clarté : 15 pts
- Pertinence : 20 pts
- Faisabilité : 20 pts
- Impact potentiel : 25 pts
- Originalité : 10 pts
- Niveau de détail : 10 pts

## RBAC (4 rôles)

| Permission | Employé | Superviseur | Direction | Admin |
|------------|---------|-------------|-----------|-------|
| Évaluation 5S — créer | ✅ | ✅ | ✅ | ❌ |
| Évaluation 5S — voir tout | ❌ | Équipe | ✅ | ✅ |
| Suggestion — créer | ✅ | ✅ | ✅ | ❌ |
| Suggestion — valider | ❌ | Pré-valider | ✅ | ❌ |
| Dashboard direction | ❌ | ❌ | ✅ | ✅ |
| Administration | ❌ | ❌ | ❌ | ✅ |

## Production

```bash
npm run build
npm start
```

Variables d'environnement requises en production :
- `DATABASE_URL` — connexion PostgreSQL
- `NEXTAUTH_SECRET` — clé secrète (min 32 chars)
- `NEXTAUTH_URL` — URL de l'application
- `ANTHROPIC_API_KEY` — clé API Anthropic (optionnel)
