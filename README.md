# ◈ ContactHub v2.0 — Application de Gestion de Contacts Professionnelle

Stack : **Node.js** + **Angular 17** + **MongoDB**

---

## ✨ Fonctionnalités complètes

### 👤 Espace Utilisateur
| Fonctionnalité | Détail |
|---|---|
| Authentification JWT | Inscription, connexion, déconnexion sécurisée |
| Gestion des contacts | CRUD complet, vue grille + liste |
| Fiche contact détaillée | Coordonnées, adresse, réseaux sociaux, notes, tags |
| Favoris | Marquer/démarquer en un clic |
| Recherche full-text | Par nom, email, entreprise |
| Filtres avancés | Par groupe, tag, favoris, imports récents |
| Import CSV | Upload fichier, validation, rapport d'erreurs |
| Export CSV | Téléchargement de tous ses contacts |
| Dashboard analytique | KPI, graphiques source, top entreprises, activité |
| Profil utilisateur | Modifier nom/email, changer mot de passe |
| Sélection multiple | Suppression en masse |
| Pagination | Navigation fluide |

### ⚙️ Espace Administrateur
| Fonctionnalité | Détail |
|---|---|
| Dashboard global | KPI plateforme, graphiques de croissance 6 mois |
| Gestion utilisateurs | Lister, créer, modifier, activer/désactiver, supprimer |
| Fiche utilisateur | Contacts + journal d'activité de chaque user |
| Contacts globaux | Voir tous les contacts de tous les utilisateurs |
| Export admin CSV | Export de la vue filtrée |
| Statistiques temps réel | Nouveaux users/contacts ce mois, top contributeurs |
| Protection des routes | Guard admin côté frontend + middleware côté backend |

---

## 🗂️ Structure du projet

```
contacts-app/
├── backend/
│   ├── config/database.js
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── contactController.js
│   │   │   └── adminController.js       ← NOUVEAU
│   │   ├── middleware/
│   │   │   ├── auth.js                  (protect + adminOnly)
│   │   │   └── errorHandler.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Contact.js
│   │   │   └── Activity.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── contacts.js
│   │   │   └── admin.js                 ← NOUVEAU
│   │   ├── utils/seed.js
│   │   └── server.js
│   ├── .env
│   └── package.json
│
└── frontend/
    └── src/app/
        ├── components/shared/
        │   ├── navbar/                  (lien Admin si role=admin)
        │   └── toast/
        ├── guards/
        │   ├── auth.guard.ts
        │   └── admin.guard.ts           ← NOUVEAU
        ├── pages/
        │   ├── login/
        │   ├── register/
        │   ├── contacts/
        │   ├── contact-detail/
        │   ├── dashboard/
        │   ├── profile/
        │   └── admin/                   ← NOUVEAU
        │       ├── admin-layout.component.ts
        │       ├── admin-dashboard.component.ts
        │       ├── admin-users.component.ts
        │       ├── admin-user-detail.component.ts
        │       └── admin-contacts.component.ts
        └── services/
            ├── auth.service.ts
            ├── contact.service.ts
            ├── admin.service.ts         ← NOUVEAU
            └── toast.service.ts
```

---

## ⚙️ Installation

### Prérequis
- Node.js >= 18
- MongoDB (local ou Atlas)
- Angular CLI : `npm install -g @angular/cli`

### Backend
```bash
cd backend
npm install
# Le fichier .env est déjà inclus (modifier si besoin)
npm run dev
```

### Frontend
```bash
cd frontend
npm install
ng serve
```

### Données de démo
```bash
cd backend
npm run seed
```

---

## 🔑 Comptes disponibles après seed

| Rôle | Email | Mot de passe | Accès |
|------|-------|-------------|-------|
| **Admin** | admin@contacts.com | admin1234 | Tout + panneau admin |
| **User** | demo@contacts.com | demo1234 | Espace personnel |
| **User** | marie@contacts.com | marie1234 | Espace personnel |

---

## 🌐 URLs de l'application

| Page | URL | Accès |
|------|-----|-------|
| Connexion | http://localhost:4200/login | Public |
| Contacts | http://localhost:4200/contacts | Authentifié |
| Dashboard | http://localhost:4200/dashboard | Authentifié |
| Profil | http://localhost:4200/profile | Authentifié |
| **Admin Dashboard** | http://localhost:4200/admin | **Admin only** |
| **Admin Utilisateurs** | http://localhost:4200/admin/users | **Admin only** |
| **Admin Contacts** | http://localhost:4200/admin/contacts | **Admin only** |

---

## 🔌 API REST

### Auth — `/api/auth`
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | /register | Inscription |
| POST | /login | Connexion |
| GET | /me | Profil courant |
| PUT | /profile | Modifier profil |
| PUT | /change-password | Changer mot de passe |

### Contacts — `/api/contacts` (auth requis)
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | / | Liste paginée + filtres |
| POST | / | Créer contact |
| GET | /:id | Détail |
| PUT | /:id | Modifier |
| DELETE | /:id | Supprimer |
| DELETE | /bulk | Suppression multiple |
| PATCH | /:id/favorite | Toggle favori |
| GET | /export | Export CSV |
| POST | /import | Import CSV |
| GET | /stats | Statistiques |
| GET | /tags | Liste tags |
| GET | /groups | Liste groupes |

### Admin — `/api/admin` (admin requis)
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | /stats | Stats globales plateforme |
| GET | /users | Liste utilisateurs |
| POST | /users | Créer utilisateur |
| GET | /users/:id | Détail utilisateur |
| PUT | /users/:id | Modifier utilisateur |
| DELETE | /users/:id | Supprimer utilisateur |
| PATCH | /users/:id/toggle | Activer/désactiver |
| GET | /contacts | Tous les contacts |

---

## 🐳 Docker

```bash
docker-compose up --build
```
Frontend : http://localhost:4200
Backend : http://localhost:3000

---

## 🔐 Sécurité
- JWT Bearer Token (7 jours)
- Bcrypt hash passwords (salt 12)
- Helmet HTTP headers
- CORS configuré
- Rate limiting 500 req/15min
- Routes admin protégées backend + frontend
