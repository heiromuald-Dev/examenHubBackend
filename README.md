# Exam Hub Backend

Backend REST du projet Exam Hub, développé avec Node.js, Express, TypeScript et PostgreSQL. L’accès à la base utilise exclusivement `pg` et du SQL paramétré. L’application suit l’architecture imposée `Controller`, `Service`, `Repositorie`, `Model`, `Security`, `middlewares`, `validators` et `types`.

## Prérequis

Il faut disposer de Node.js 20 ou supérieur, de npm et de Docker avec Docker Compose. Le service PostgreSQL est fourni par `docker-compose.yml` et utilise PostgreSQL 16.

## Installation locale

Copiez `.env.example` vers `.env`, puis renseignez uniquement les valeurs destinées à votre environnement local. Le fichier `.env` est ignoré par Git et ne doit jamais être ajouté au dépôt.

Sous PowerShell :

```powershell
Copy-Item .env.example .env
npm install
docker compose up -d postgres
npm run migrate
npm run seed:admin
npm run dev
```

Sous Linux ou macOS :

```bash
cp .env.example .env
npm install
docker compose up -d postgres
npm run migrate
npm run seed:admin
npm run dev
```

L’API est disponible sur `http://localhost:3000`. La route `GET /api/health` permet de vérifier que le serveur répond. Pour repartir de zéro avec une base neuve, utilisez `docker compose down -v`, puis relancez `docker compose up -d postgres` et `npm run migrate`. Cette opération supprime les données locales du volume PostgreSQL.

## Variables d’environnement

Les fichiers versionnés contiennent uniquement `.env.example`, sans secret réel. En local, les valeurs sont placées dans `.env`. Dans GitHub Actions ou dans l’environnement de déploiement, elles doivent être enregistrées dans les secrets ou variables protégées du dépôt.

| Variable | Rôle |
|---|---|
| `DATABASE_URL` | URL complète de connexion PostgreSQL utilisée par l’application |
| `POSTGRES_DB` | Nom de la base du conteneur local |
| `POSTGRES_USER` | Utilisateur PostgreSQL local |
| `POSTGRES_PASSWORD` | Mot de passe PostgreSQL local |
| `JWT_SECRET` | Secret de signature JWT d’au moins 32 caractères |
| `JWT_EXPIRES_IN` | Durée de validité du JWT, par exemple `1d` |
| `CORS_ORIGIN` | Origine frontend autorisée, par exemple `http://localhost:5173` |
| `ADMIN_NAME` | Nom utilisé lors du seed initial |
| `ADMIN_EMAIL` | Email de l’administrateur initial |
| `ADMIN_PASSWORD` | Mot de passe de l’administrateur initial |

Les secrets ne doivent pas être préfixés par `VITE_` et ne doivent jamais être envoyés au frontend. Le backend reçoit le JWT dans `Authorization: Bearer <token>`.

## Authentification et rôles

`POST /api/auth/login` vérifie l’email, le mot de passe avec bcrypt et l’état actif du compte. La réponse contient un JWT et l’utilisateur public. Les routes admin exigent un utilisateur de rôle `admin`. Les routes `/api/my` exigent un utilisateur de rôle `student`. Un compte étudiant est désactivé avec `DELETE /api/students/:id` et n’est pas physiquement supprimé.

## Routes API

Toutes les erreurs sont renvoyées en JSON sous la forme `{ "message": "..." }`. Les réponses de succès sont généralement enveloppées dans `{ "data": ... }`.

### Authentification et profil

| Méthode | Route | Accès | Fonction |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Connexion et émission d’un JWT |
| `GET` | `/api/auth/me` | Authentifié | Lire son profil public |
| `PUT` | `/api/auth/me/profile` | Authentifié | Modifier son nom et son email |
| `PUT` | `/api/auth/me/password` | Authentifié | Changer son mot de passe |

### Administration des étudiants, cours et groupes

| Méthode | Route | Fonction |
|---|---|---|
| `GET` | `/api/students` | Lister les étudiants |
| `GET` | `/api/students/:id` | Voir un étudiant avec son historique de résultats |
| `POST` | `/api/students` | Créer un étudiant |
| `PUT` | `/api/students/:id` | Modifier un étudiant et ses groupes |
| `DELETE` | `/api/students/:id` | Désactiver un étudiant |
| `GET` | `/api/courses` | Lister les UE |
| `POST` | `/api/courses` | Créer une UE |
| `PUT` | `/api/courses/:id` | Modifier une UE |
| `DELETE` | `/api/courses/:id` | Supprimer une UE si elle n’est pas référencée |
| `GET` | `/api/groups` | Lister les groupes |
| `POST` | `/api/groups` | Créer un groupe |
| `PUT` | `/api/groups/:id` | Modifier un groupe |
| `DELETE` | `/api/groups/:id` | Supprimer un groupe si aucune relation ne l’utilise |

Les groupes sont une extension cohérente avec l’interface d’administration demandée par l’équipe. Ils servent à déterminer quels étudiants peuvent participer à un examen.

### Administration des examens et QCM

| Méthode | Route | Fonction |
|---|---|---|
| `GET` | `/api/exams` | Lister les examens |
| `POST` | `/api/exams` | Créer un examen et l’affecter à des groupes |
| `GET` | `/api/exams/:id` | Voir un examen |
| `PUT` | `/api/exams/:id` | Modifier les métadonnées d’un examen |
| `DELETE` | `/api/exams/:id` | Supprimer un examen si aucune tentative n’existe |
| `GET` | `/api/exams/:examId/questions` | Lister les questions et choix côté admin |
| `POST` | `/api/exams/:examId/questions` | Créer une question QCM |
| `PUT` | `/api/questions/:id` | Modifier une question et ses choix |
| `DELETE` | `/api/questions/:id` | Supprimer une question |
| `GET` | `/api/exams/:examId/results` | Voir le résumé et le détail des étudiants, notes et tentatives |

Une question possède entre deux et six choix et exactement un choix correct. Les contrôles sont appliqués par les validateurs applicatifs et par PostgreSQL. Après le démarrage d’une première tentative, les questions, choix et suppression de l’examen sont verrouillés par la base. Les métadonnées générales de l’examen restent modifiables conformément au sujet.

### Parcours étudiant

| Méthode | Route | Fonction |
|---|---|---|
| `GET` | `/api/my/exams` | Lister les examens disponibles pour les groupes de l’étudiant |
| `POST` | `/api/my/exams/:examId/start` | Démarrer une tentative unique et recevoir les questions sans bonnes réponses |
| `POST` | `/api/my/attempts/:attemptId/submit` | Soumettre les réponses, éventuellement partiellement |
| `GET` | `/api/my/results` | Consulter son historique |
| `GET` | `/api/my/attempts/:attemptId/correction` | Consulter la correction d’une tentative soumise |

Le démarrage crée la tentative en base immédiatement. Une actualisation, une sortie de page ou un nouvel appel à `start` ne permet donc pas de reprendre ou de recréer l’examen. La date limite est le minimum entre `started_at + duration_minutes` et `ends_at`. Une soumission après cette limite est refusée.

Les champs `is_correct` ne sont jamais renvoyés dans les questions destinées à l’étudiant. La correction n’est renvoyée qu’après une soumission autorisée. Les choix absents sont enregistrés comme réponses non renseignées, ce qui permet une soumission partielle.

La colonne `attempts.score` contient la somme des points obtenus, conformément au sujet. `attempts.max_score` contient le total possible et `attempts.percentage` contient le pourcentage calculé côté serveur.

## Base de données

Le fichier `database/migrations/createInitialDatabaseSchema.sql` est la migration initiale versionnée. Il crée les utilisateurs, cours, groupes, examens, questions, choix, tentatives, réponses, index, contraintes, triggers et la vue de synthèse des résultats. Le conteneur Docker exécute automatiquement les scripts du dossier `/docker-entrypoint-initdb.d` lorsqu’un volume de données neuf est créé. Le script `npm run migrate` permet aussi d’appliquer la migration explicitement.

Aucun ORM n’est utilisé. Les repositories utilisent uniquement des requêtes SQL paramétrées et les opérations sensibles de soumission sont exécutées dans une transaction PostgreSQL.

## Commandes de contrôle

```bash
npm run check
npm test
npm run build
```

Les tests présents vérifient notamment bcrypt, JWT, les validateurs d’authentification, les règles QCM, les réponses partielles, les doublons de réponses et le calcul du score. Une exécution complète contre PostgreSQL réel doit être faite localement ou dans la CI avec Docker, car elle dépend d’un serveur PostgreSQL disponible.

## Fichiers à pousser et fichiers privés

Il faut pousser le code TypeScript, la migration SQL, `docker-compose.yml`, `Dockerfile`, `package.json`, `package-lock.json`, `tsconfig.json`, `README.md`, `.env.example`, `.gitignore`, les workflows CI et les tests. Il ne faut pas pousser `.env`, `node_modules`, `dist`, `coverage`, les journaux, les dumps SQL, les données réelles ni les secrets administrateur.

Le projet généré dans cet environnement est une archive locale de livraison. Il n’est pas synchronisé automatiquement avec `https://github.com/heiromuald-Dev/examenHubBackend`. Il faut copier son contenu dans le dépôt réel, vérifier `git status`, créer une branche de travail, committer les fichiers nécessaires, puis ouvrir une pull request vers `dev`.
