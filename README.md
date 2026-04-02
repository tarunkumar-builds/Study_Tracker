# Study Tracker

Study Tracker is a full-stack study management application built for students who want one place to manage syllabus progress, focus sessions, revision, notes, analytics, and previous year question papers.

It combines subject-wise progress tracking, a Pomodoro timer, notes, flashcards with spaced repetition, timetable planning, and analytics in a single MERN-style architecture:

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database: MongoDB with Mongoose

## 1. Project Overview

### Problem this project solves

Students often use separate apps for:

- tracking syllabus completion
- writing notes
- timing study sessions
- revising with flashcards
- checking analytics
- collecting previous year papers

This project brings those workflows together so study progress is not scattered across multiple tools.

### Core idea

The project treats a subject as the central unit. Around each subject, the user can:

- create chapters and topics
- mark topics complete
- track time spent studying
- write notes
- create flashcards
- associate focus sessions with that subject
- view performance analytics

## 2. Main Features

### 2.1 Authentication

- User registration and login
- JWT-based protected routes
- Persistent login using `localStorage`
- User preferences model on the backend

### 2.2 Subject and Syllabus Tracking

- Create subjects with custom colors
- Add chapters inside each subject
- Add topics inside each chapter
- Mark topics as completed
- Automatic chapter-level and subject-level completion calculation
- Soft delete for subjects with password confirmation

### 2.3 Notes Management

- Create notes linked to subjects
- Organize notes using folders (subjects are reused as note folders)
- Add categories and tags
- Pin important notes
- Search notes by title/content using MongoDB text search

### 2.4 Flashcards and Revision

- Create subject-wise flashcards
- Review due cards
- Spaced repetition scheduling using the SM-2 algorithm
- Track review accuracy, due cards, and ease factor

### 2.5 Pomodoro Timer

- Custom focus and break durations
- Subject-linked focus sessions
- Pause, reset, and switch modes
- Fullscreen focus mode
- Sound notification on cycle completion
- Study time persistence to backend

### 2.6 Analytics

- Daily study timeline
- Weekly study chart
- Subject-wise time distribution
- Completion trend chart
- Active days, streak, average study minutes

### 2.7 Timetable

- 24-hour daily timetable
- Each slot can be assigned to a subject
- Optional label per slot
- Timetable repeats daily

### 2.8 Previous Year Papers

- Embedded previous year question paper viewer
- In-browser PDF preview
- Open and download actions

## 3. Technology Stack

## 3.1 Frontend

| Technology | Used For | Why this choice |
| --- | --- | --- |
| React 18 | Building the UI as reusable components | Better for interactive dashboards than plain HTML/JS; component model fits pages like dashboard, timer, notes, and flashcards cleanly |
| Vite | Frontend dev server and build tool | Faster startup and rebuilds than older setups like Create React App; simpler configuration |
| React Router DOM | Client-side routing | A good fit for protected pages and nested layout routing |
| Tailwind CSS | Styling | Faster UI development, consistent utility classes, and easier responsive design than writing large custom CSS files |
| Axios | API communication | Cleaner interceptors and base configuration than raw `fetch`, especially for JWT handling |
| Recharts | Analytics charts | Easier React-based chart composition than lower-level charting libraries for this project size |
| Lucide React | Icons | Clean icon set, tree-shakeable, and simpler than shipping a large icon pack |
| React Hot Toast | Notifications | Lightweight and easy for success/error feedback |
| date-fns | Date formatting/manipulation support | Smaller and more modular than Moment.js |

## 3.2 Backend

| Technology | Used For | Why this choice |
| --- | --- | --- |
| Node.js | Server runtime | Natural fit with a JavaScript frontend and simple full-stack development |
| Express | REST API server | Minimal, flexible, and easier to structure for CRUD-heavy student projects than heavier frameworks |
| MongoDB | Database | Good fit for nested data like subjects -> chapters -> topics and flexible note/flashcard/session documents |
| Mongoose | MongoDB object modeling | Schema validation, hooks, methods, and population make the backend cleaner than using the raw MongoDB driver |
| JWT (`jsonwebtoken`) | Authentication tokens | Simple stateless auth for API requests |
| bcrypt | Password hashing | Standard and secure way to hash passwords before storing |
| dotenv | Environment variable loading | Keeps secrets and environment-specific settings out of source code |
| cors | Cross-origin communication | Required because frontend and backend run on different local ports |
| cookie-parser | Cookie access | Allows auth token support via cookies if used |

## 4. Libraries Used and Why

This section explains the practical reason each important library exists in this project.

### Frontend libraries

#### `react`

- Used to build all pages and reusable UI components
- Chosen because the app has many dynamic states: login state, study data, timer state, flashcard review state, and analytics

#### `react-router-dom`

- Used in [`frontend/src/App.jsx`](./frontend/src/App.jsx) for public/protected navigation
- Chosen because the project has multiple screens and requires auth-gated routes

#### `axios`

- Used in [`frontend/src/services/api.js`](./frontend/src/services/api.js)
- Chosen because interceptors make token injection and unauthorized redirects much easier than raw `fetch`

#### `recharts`

- Used in dashboard and analytics pages
- Chosen because it works naturally with React components and covers bar, line, area, and pie charts without much boilerplate

#### `lucide-react`

- Used across layout and pages for icons
- Chosen because it is lightweight, consistent, and modern

#### `react-hot-toast`

- Used for user feedback on actions like login, save, delete, load errors
- Chosen because it keeps UX responsive without building a custom notification system

#### `tailwindcss`

- Used for almost all styling
- Chosen because utility-first styling is faster to maintain for dashboards, cards, forms, and responsive layouts

### Backend libraries

#### `express`

- Used to define API routes and middleware
- Chosen because the backend is mainly REST + auth + CRUD, which Express handles very well with minimal complexity

#### `mongoose`

- Used for schemas such as `User`, `Subject`, `Note`, `Flashcard`, `PomodoroSession`, `StudyHistory`, and `Timetable`
- Chosen because nested schemas, methods, hooks, indexes, and `.populate()` are very useful in this project

#### `bcrypt`

- Used in [`backend/models/User.js`](./backend/models/User.js)
- Chosen over storing plain passwords because password hashing is essential for security

#### `jsonwebtoken`

- Used in [`backend/middlewares/auth.js`](./backend/middlewares/auth.js)
- Chosen because JWT is straightforward for SPA + REST authentication

#### `express-validator`

- Present in backend dependencies
- Useful for request validation, although the current controllers mostly perform manual validation

## 5. High-Level Architecture

```text
React UI
  ->
Context + Service Layer
  ->
Axios client with auth token
  ->
Express API routes
  ->
Controllers
  ->
Mongoose models
  ->
MongoDB
```

### Frontend responsibilities

- render pages
- manage navigation
- hold auth and study state
- call backend APIs
- display charts and progress

### Backend responsibilities

- validate and process requests
- authenticate users
- update business data
- calculate progress/statistics
- store data in MongoDB

## 6. Folder Structure

```text
study-tracker/
|-- backend/
|   |-- config/         # Database connection
|   |-- controllers/    # API request handlers
|   |-- middlewares/    # Auth and error middleware
|   |-- models/         # Mongoose schemas
|   |-- routes/         # Express route definitions
|   |-- seeds/          # Seed scripts for demo/sample data
|   `-- server.js       # Backend entry point
|
|-- frontend/
|   |-- src/
|   |   |-- components/ # Shared UI pieces
|   |   |-- context/    # Auth and study global state
|   |   |-- pages/      # Screen-level pages
|   |   `-- services/   # Axios-based API calls
|   `-- vite.config.js  # Frontend build configuration
|
|-- DEPLOYMENT.md
|-- PROJECT_SUMMARY.md
`-- README.md
```

## 7. Frontend Working

## 7.1 App bootstrap

The app starts from:

- [`frontend/src/main.jsx`](./frontend/src/main.jsx)
- [`frontend/src/App.jsx`](./frontend/src/App.jsx)

`App.jsx` sets up:

- `BrowserRouter`
- `AuthProvider`
- `StudyProvider`
- protected routes
- `react-hot-toast` notifications

### Route structure

- `/login`
- `/register`
- `/`
- `/subject/:id`
- `/notes`
- `/flashcards`
- `/timer`
- `/analytics`
- `/previous-year-papers`

### Route protection

Protected pages are wrapped by `ProtectedRoute`, which checks auth state from `AuthContext`. If the user is not authenticated, they are redirected to `/login`.

## 7.2 Auth state flow

Auth is handled in [`frontend/src/context/AuthContext.jsx`](./frontend/src/context/AuthContext.jsx).

### What it does

- checks `localStorage` for token and user on app load
- exposes `register`, `login`, `logout`, and `updatePreferences`
- stores login state globally

### Why this design works well

Using React Context avoids passing auth props through many components and keeps route guards simple.

## 7.3 Study state flow

Study data is handled in [`frontend/src/context/StudyContext.jsx`](./frontend/src/context/StudyContext.jsx).

It loads and stores:

- subjects
- sessions
- notes
- flashcards
- daily timeline

On login, it bootstraps the main study data using parallel requests. This improves perceived speed because dashboard-related data is loaded together instead of one request at a time.

## 7.4 API service layer

The service layer lives in:

- [`frontend/src/services/api.js`](./frontend/src/services/api.js)
- [`frontend/src/services/authService.js`](./frontend/src/services/authService.js)
- [`frontend/src/services/subjectService.js`](./frontend/src/services/subjectService.js)
- [`frontend/src/services/index.js`](./frontend/src/services/index.js)

### How it works

1. `api.js` creates a shared Axios instance.
2. Request interceptor adds `Authorization: Bearer <token>`.
3. Response interceptor catches `401` and redirects to login.
4. Page components call service functions instead of calling Axios directly.

This is a good separation because pages stay focused on UI, while API details stay centralized.

## 8. Backend Working

## 8.1 Server startup

The backend starts from [`backend/server.js`](./backend/server.js).

### Startup sequence

1. Load environment variables with `dotenv`
2. Connect MongoDB via [`backend/config/database.js`](./backend/config/database.js)
3. Register middleware:
   - `cors`
   - `express.json()`
   - `express.urlencoded()`
   - `cookie-parser`
4. Mount API routes
5. expose `/api/health`
6. register not-found and error middleware

## 8.2 Authentication middleware

[`backend/middlewares/auth.js`](./backend/middlewares/auth.js) handles protected access.

### Auth process

1. Read token from `Authorization` header or cookie
2. Verify JWT with `JWT_SECRET`
3. Load user from database
4. Attach `req.user`
5. Continue to controller

This keeps route handlers clean because they can trust `req.user`.

## 8.3 Data models

### `User`

- stores name, email, password, preferences
- hashes password before save
- compares passwords with bcrypt

### `Subject`

- stores subject metadata and nested syllabus structure
- contains chapters and topics
- stores timer-linked and topic-linked time
- auto-recalculates completion and time values before save

### `Note`

- linked to a user and subject
- supports title/content search using a text index
- supports pinning, tags, category, and color

### `Flashcard`

- linked to a user and subject
- stores SM-2 fields like `interval`, `repetitions`, `easeFactor`, `nextReviewDate`
- updates review schedule through model method `updateSpacedRepetition`

### `PomodoroSession`

- stores each focus/break session
- includes duration, type, completion flag, start/end times, and subject link

### `StudyHistory`

- stores one aggregated record per user per day
- powers fast analytics for timeline, streak, totals, and subject breakdown

### `Timetable`

- stores repeating daily slots from hour `0` to `23`

## 9. Full Working of the Project

This is the end-to-end working flow of the application.

## 9.1 User registration and login

1. User opens `/register` or `/login`
2. Frontend sends credentials through `authService`
3. Backend `authController` validates input
4. Password is hashed on registration or compared on login
5. JWT token is generated
6. Frontend stores token and user in `localStorage`
7. Protected routes become accessible

## 9.2 Subject creation and syllabus tracking

1. User creates a subject from the dashboard
2. Frontend sends `POST /api/subjects`
3. Backend stores subject with user ID and color
4. On subject details page, user adds chapters and topics
5. Topics can be toggled complete/incomplete
6. `recalculateSubjectProgress()` updates:
   - chapter completion
   - subject completion
   - total time spent
7. Updated subject is returned and UI refreshes immediately

## 9.3 Notes workflow

1. User chooses a folder/subject
2. User creates or edits a note
3. Backend stores note with title, content, category, tags, pin state, and color
4. Search uses MongoDB text index on title and content
5. Notes list is refreshed and sorted with pinned notes first

## 9.4 Flashcard workflow

1. User creates a flashcard with question, answer, and subject
2. Flashcard initially becomes due for review
3. During review, user rates the card
4. Backend maps rating to SM-2 quality score
5. `updateSpacedRepetition()` recalculates:
   - repetitions
   - interval
   - ease factor
   - next review date
6. Analytics like due count and accuracy update from stored review data

## 9.5 Pomodoro timer workflow

This is one of the most important working flows in the project.

### On the frontend

1. User selects a subject and starts a focus session
2. Timer counts down second by second
3. Focus seconds are accumulated locally
4. Whole minutes are periodically flushed to backend
5. On pause/reset/mode switch, remaining whole minutes are persisted
6. On cycle completion:
   - focus minutes are saved
   - a completion marker session is added
   - timer switches to break mode

### On the backend

When a focus session is created:

1. `PomodoroSession` record is stored
2. Subject `timerTimeSpent` is updated
3. `StudyHistory` is updated for that date
4. Daily totals and subject breakdown are adjusted

This is a strong design choice because analytics do not need to recalculate everything from raw session data every time.

## 9.6 Analytics workflow

Analytics is derived mainly from `StudyHistory`.

### Range and timeline logic

- fetch day-wise data between `startDate` and `endDate`
- fill missing days with zero values
- calculate:
  - total minutes
  - active days
  - average minutes
  - streak
  - completion percent relative to daily goal

### Visual outputs

- bar charts for minutes
- pie chart for subject distribution
- line chart for completion trend

## 9.7 Timetable workflow

1. User opens the timetable modal from dashboard
2. Backend returns an existing timetable or auto-creates a default 24-slot one
3. User assigns subjects and labels to hour slots
4. Frontend sends updated slots
5. Backend normalizes and stores them

## 9.8 Previous year papers workflow

1. PDF file names are mapped into human-friendly labels
2. User selects a paper
3. PDF is displayed inside an `iframe`
4. User can open in a new tab or download it

## 10. Page-by-Page Summary

### Dashboard

- subject overview
- daily study view
- 7-day trend
- quick stats
- timetable access
- shareable progress card

### Subject Details

- chapter/topic management
- completion toggling
- subject progress summary
- protected subject deletion

### Notes

- folder-based note organization
- note editor
- search
- categories/tags
- pin/unpin

### Flashcards

- due cards
- review deck
- manual create/edit/delete
- revision stats

### Timer

- focus/break cycle
- subject-linked study tracking
- today’s subject breakdown
- fullscreen mode

### Analytics

- timeline chart
- weekly study chart
- subject distribution
- streak and averages

### Previous Year Papers

- paper library
- inline PDF reader
- download support

## 11. API Summary

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PUT /api/auth/preferences`
- `POST /api/auth/logout`

### Subjects

- `GET /api/subjects`
- `POST /api/subjects`
- `GET /api/subjects/:id`
- `PUT /api/subjects/:id`
- `DELETE /api/subjects/:id`

### Chapters and Topics

- `POST /api/subjects/:id/chapters`
- `PUT /api/subjects/:id/chapters/:chapterId`
- `DELETE /api/subjects/:id/chapters/:chapterId`
- `POST /api/subjects/:id/chapters/:chapterId/topics`
- `PUT /api/subjects/:id/chapters/:chapterId/topics/:topicId/toggle`
- `PATCH /api/topics/:id/toggle`
- `PUT /api/subjects/:id/chapters/:chapterId/topics/:topicId/time`
- `DELETE /api/subjects/:id/chapters/:chapterId/topics/:topicId`

### Notes

- `GET /api/notes`
- `GET /api/notes/:id`
- `POST /api/notes`
- `PUT /api/notes/:id`
- `DELETE /api/notes/:id`
- `PUT /api/notes/:id/pin`

### Flashcards

- `GET /api/flashcards`
- `GET /api/flashcards/due`
- `GET /api/flashcards/stats`
- `GET /api/flashcards/:id`
- `POST /api/flashcards`
- `POST /api/flashcards/bulk`
- `PUT /api/flashcards/:id`
- `POST /api/flashcards/:id/review`
- `DELETE /api/flashcards/:id`

### Study Sessions and Analytics

- `GET /api/pomodoro`
- `POST /api/pomodoro`
- `GET /api/pomodoro/stats/daily`
- `GET /api/pomodoro/stats/weekly`
- `GET /api/pomodoro/stats/overall`
- `DELETE /api/pomodoro/:id`
- `POST /api/sessions`
- `GET /api/sessions/range`
- `GET /api/sessions/history`

### Timetable

- `GET /api/timetable`
- `PUT /api/timetable`

## 12. Setup Instructions

## 12.1 Backend

Create a backend `.env` file with values required by the code:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/study-tracker
JWT_SECRET=your_secret
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Run:

```bash
cd backend
npm install
npm run dev
```

## 12.2 Frontend

Optional frontend `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Run:

```bash
cd frontend
npm install
npm run dev
```

## 13. Why This Project Design Works Well

### Good architectural decisions

- Clear frontend/backend separation
- Centralized API layer with Axios interceptors
- Global auth and study state through React Context
- MongoDB structure matches nested syllabus data naturally
- Aggregated `StudyHistory` improves analytics performance
- Progress logic is centralized in `progressUtils.js`
- Flashcard algorithm is encapsulated in the model, not spread across controllers

### Practical advantages over simpler alternatives

- Better than storing everything in local storage because data persists across devices/users
- Better than a SQL-heavy design for this specific nested syllabus model
- Better than manual chart drawing because `Recharts` handles data visualization cleanly
- Better than a single-page unstructured script because routes, services, contexts, and controllers separate concerns properly

## 14. Current Limitations

- No automated test suite is configured yet
- `express-validator` is installed but not fully used across controllers
- Some installed frontend dependencies are not currently active in main source usage
- Auth primarily relies on JWT in `localStorage`, even though cookie support exists in middleware
- The timetable currently repeats daily only, not weekly variants

## 15. Final Summary

Study Tracker is a well-structured full-stack student productivity application centered around subjects, syllabus progress, focus tracking, and revision.

Its strongest technical ideas are:

- nested syllabus modeling with MongoDB
- centralized global state on the frontend
- token-based authentication
- persistent Pomodoro session logging
- pre-aggregated daily analytics
- spaced repetition flashcards using SM-2

For a student minor project, this is a strong combination of:

- real-world full-stack architecture
- useful educational features
- meaningful backend logic
- clear separation of concerns
- scalable room for future improvements
