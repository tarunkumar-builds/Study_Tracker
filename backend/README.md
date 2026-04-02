# Study Tracker Backend API

Node.js Express backend with MongoDB for the Study Tracker application.

## Features

- 🔐 JWT Authentication (Register, Login, Logout)
- 📚 Subject Management (CRUD with nested chapters & topics)
- 📝 Notes System (Create, Edit, Search, Pin)
- 🎴 Spaced Repetition Flashcards (SM-2 Algorithm)
- ⏱️ Pomodoro Timer Sessions (Track focus time)
- 📊 Analytics & Statistics
- 🔒 Protected Routes
- ⚡ RESTful API Design

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (jsonwebtoken) + bcrypt
- **Validation:** express-validator
- **Security:** CORS, Cookie Parser

## Installation

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Setup

1. **Clone and navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/study-tracker
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

4. **Start MongoDB:**
```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas cloud connection string in .env
```

5. **Run the server:**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

6. **Seed test data (optional):**
```bash
npm run seed
```

Test user credentials:
- Email: `test@example.com`
- Password: `password123`

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | Login user | No |
| GET | `/me` | Get current user | Yes |
| PUT | `/preferences` | Update user preferences | Yes |
| POST | `/logout` | Logout user | Yes |

### Subjects (`/api/subjects`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all subjects | Yes |
| POST | `/` | Create subject | Yes |
| GET | `/:id` | Get single subject | Yes |
| PUT | `/:id` | Update subject | Yes |
| DELETE | `/:id` | Delete subject | Yes |
| POST | `/:id/chapters` | Add chapter | Yes |
| PUT | `/:id/chapters/:chapterId` | Update chapter | Yes |
| DELETE | `/:id/chapters/:chapterId` | Delete chapter | Yes |
| POST | `/:id/chapters/:chapterId/topics` | Add topic | Yes |
| PUT | `/:id/chapters/:chapterId/topics/:topicId/toggle` | Toggle topic completion | Yes |
| PUT | `/:id/chapters/:chapterId/topics/:topicId/time` | Update topic time | Yes |
| DELETE | `/:id/chapters/:chapterId/topics/:topicId` | Delete topic | Yes |

### Notes (`/api/notes`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all notes (with search & filter) | Yes |
| POST | `/` | Create note | Yes |
| GET | `/:id` | Get single note | Yes |
| PUT | `/:id` | Update note | Yes |
| DELETE | `/:id` | Delete note | Yes |
| PUT | `/:id/pin` | Toggle pin status | Yes |

### Flashcards (`/api/flashcards`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all flashcards | Yes |
| POST | `/` | Create flashcard | Yes |
| POST | `/bulk` | Bulk create flashcards | Yes |
| GET | `/due` | Get due flashcards | Yes |
| GET | `/stats` | Get flashcard statistics | Yes |
| GET | `/:id` | Get single flashcard | Yes |
| PUT | `/:id` | Update flashcard | Yes |
| DELETE | `/:id` | Delete flashcard | Yes |
| POST | `/:id/review` | Review flashcard (SM-2) | Yes |

### Pomodoro Sessions (`/api/pomodoro`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all sessions | Yes |
| POST | `/` | Create session | Yes |
| GET | `/stats/daily` | Get daily stats | Yes |
| GET | `/stats/weekly` | Get weekly stats | Yes |
| GET | `/stats/overall` | Get overall stats | Yes |
| DELETE | `/:id` | Delete session | Yes |

## Request Examples

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Create Subject
```bash
POST /api/subjects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Mathematics",
  "color": "#10B981"
}
```

### Add Chapter
```bash
POST /api/subjects/:subjectId/chapters
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Chapter 1: Algebra"
}
```

### Create Note
```bash
POST /api/notes
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Important Formula",
  "content": "Quadratic formula: x = (-b ± √(b²-4ac)) / 2a",
  "subjectId": "...",
  "category": "Formulas"
}
```

### Review Flashcard (Spaced Repetition)
```bash
POST /api/flashcards/:id/review
Authorization: Bearer <token>
Content-Type: application/json

{
  "quality": 4
}
```
Quality scale: 0 (total blackout) to 5 (perfect response)

## Database Models

### User
- name, email, password (hashed)
- preferences (pomodoro settings, theme, daily goals)

### Subject
- userId, name, color
- chapters[] (embedded)
  - name, topics[], completionPercentage
    - topics[] (embedded)
      - name, completed, durationSpent, lastStudied

### Note
- userId, subjectId, title, content
- category, tags[], isPinned, color

### Flashcard
- userId, subjectId, question, answer
- Spaced Repetition fields:
  - nextReviewDate, interval, repetitions, easeFactor
  - totalReviews, correctReviews, incorrectReviews

### PomodoroSession
- userId, subjectId, duration, type
- completed, date, startTime, endTime

## Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── subjectController.js # Subject CRUD + nested operations
│   ├── noteController.js    # Notes CRUD
│   ├── flashcardController.js # Flashcards + SM-2
│   └── pomodoroController.js  # Sessions + stats
├── middlewares/
│   ├── auth.js              # JWT authentication
│   └── errorHandler.js      # Error handling
├── models/
│   ├── User.js
│   ├── Subject.js
│   ├── Note.js
│   ├── Flashcard.js
│   └── PomodoroSession.js
├── routes/
│   ├── authRoutes.js
│   ├── subjectRoutes.js
│   ├── noteRoutes.js
│   ├── flashcardRoutes.js
│   └── pomodoroRoutes.js
├── seeds/
│   └── seedData.js          # Test data
├── .env.example
├── package.json
└── server.js                # Entry point
```

## Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Protected routes middleware
- ✅ CORS configuration
- ✅ Input validation
- ✅ User data isolation

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error message here",
  "error": "Detailed error (development only)"
}
```

## Testing

Test the API using:
- Postman
- Thunder Client (VS Code)
- cURL
- Insomnia

Health check endpoint:
```bash
GET http://localhost:5000/api/health
```

## Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/study-tracker
JWT_SECRET=generate_strong_secret_key
JWT_EXPIRE=7d
CLIENT_URL=https://your-frontend-domain.com
```

### Deployment Platforms

- **Railway:** Easy deployment with MongoDB
- **Render:** Free tier available
- **Heroku:** Simple git-based deployment
- **DigitalOcean:** Full control with droplets
- **AWS EC2:** Enterprise-grade hosting

### MongoDB Hosting

- **MongoDB Atlas:** Free tier (512MB)
- **Railway:** Integrated MongoDB
- **mLab:** Managed MongoDB hosting

## Development Tips

1. **Auto-reload:** Use `npm run dev` for development
2. **Test data:** Run `npm run seed` to populate test data
3. **Database GUI:** Use MongoDB Compass to visualize data
4. **API Testing:** Import endpoints into Postman
5. **Logs:** Check console for detailed request logs

## Common Issues

### MongoDB Connection Error
```bash
# Make sure MongoDB is running
mongod

# Or check your MONGODB_URI in .env
```

### Port Already in Use
```bash
# Change PORT in .env or kill the process
lsof -ti:5000 | xargs kill
```

### JWT Token Issues
- Ensure JWT_SECRET is set in .env
- Check token expiration
- Verify Authorization header format: `Bearer <token>`

## License

MIT License
