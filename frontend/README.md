# Study Tracker Frontend

React + Vite frontend application with Tailwind CSS for the Study Tracker system.

## Features

- ⚡ **Fast Development** with Vite and HMR
- 🎨 **Modern UI** with Tailwind CSS and custom design system
- 📱 **Fully Responsive** - Mobile, tablet, and desktop
- 🔐 **Secure Authentication** with JWT
- 🎭 **Smooth Animations** with Framer Motion
- 📊 **Data Visualization** with Recharts
- 🔔 **Toast Notifications** with React Hot Toast
- 🎯 **Type-safe Routing** with React Router v6

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS
- **Axios** - HTTP client
- **Recharts** - Chart library
- **Lucide React** - Icon library
- **Framer Motion** - Animation library
- **React Hot Toast** - Notifications
- **date-fns** - Date utilities
- **React Markdown** - Markdown rendering

## Prerequisites

- Node.js 16+ and npm/yarn
- Backend API running (see backend README)

## Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

## Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

For production:
```env
VITE_API_URL=https://your-api-domain.com/api
```

## Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── Layout.jsx       # Main layout with sidebar
│   ├── ProgressRing.jsx # Circular progress indicator
│   └── ...
├── pages/              # Page components
│   ├── Dashboard.jsx   # Main dashboard
│   ├── LoginPage.jsx   # Authentication
│   ├── SubjectDetails.jsx
│   ├── Notes.jsx
│   ├── Flashcards.jsx
│   ├── Timer.jsx
│   ├── Analytics.jsx
│   └── Profile.jsx
├── context/            # React Context
│   └── AuthContext.jsx # Global auth state
├── services/           # API services
│   ├── api.js         # Axios instance
│   ├── authService.js
│   ├── subjectService.js
│   └── index.js       # Other services
├── hooks/             # Custom hooks
├── utils/             # Helper functions
├── assets/            # Static assets
├── App.jsx            # Root component
├── main.jsx           # Entry point
└── index.css          # Global styles

## Design System

### Colors

The app uses a dark theme with custom color palette:

```js
// Primary colors
primary-500: '#0ea5e9'  // Main brand color
primary-600: '#0284c7'  // Hover state

// Dark theme
dark-bg: '#0A0E1A'      // Background
dark-card: '#141824'    // Card background
dark-border: '#1F2937'  // Border color
dark-hover: '#1E293B'   // Hover state
dark-text: '#E5E7EB'    // Text color
```

### Typography

- **Display Font**: Poppins (headings)
- **Body Font**: Inter (text)

### Components

#### Buttons

```jsx
// Primary button
<button className="btn-primary">Click me</button>

// Secondary button
<button className="btn-secondary">Cancel</button>
```

#### Cards

```jsx
// Basic card
<div className="card">Content</div>

// Hover effect card
<div className="card-hover">Content</div>
```

#### Inputs

```jsx
<input 
  type="text" 
  className="input" 
  placeholder="Enter text"
/>
```

## Component Examples

### Progress Ring

```jsx
import ProgressRing from '../components/ProgressRing';

<ProgressRing 
  percentage={75} 
  size={120} 
  strokeWidth={8}
  color="#10B981"
  showPercentage={true}
/>
```

### Using Auth Context

```jsx
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, logout, isAuthenticated } = useAuth();
  
  return (
    <div>
      {isAuthenticated && (
        <p>Welcome, {user.name}!</p>
      )}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### API Service Usage

```jsx
import subjectService from '../services/subjectService';
import { noteService } from '../services';

// Get all subjects
const subjects = await subjectService.getAll();

// Create note
const note = await noteService.create({
  title: 'My Note',
  content: 'Note content',
  subjectId: '...'
});
```

## Routing

The app uses React Router v6 with protected routes:

```jsx
// Public routes (redirect if authenticated)
/login
/register

// Protected routes (require authentication)
/                    // Dashboard
/subject/:id         // Subject details
/notes              // Notes page
/flashcards         // Flashcards page
/timer              // Pomodoro timer
/analytics          // Analytics dashboard
/profile            // User profile
```

## State Management

Uses React Context API for global state:

### Auth Context

```jsx
const {
  user,              // Current user object
  loading,           // Loading state
  isAuthenticated,   // Auth status
  register,          // Register function
  login,             // Login function
  logout,            // Logout function
  updatePreferences  // Update user preferences
} = useAuth();
```

## Responsive Design

The app is fully responsive using Tailwind breakpoints:

```jsx
// Mobile first approach
<div className="
  grid 
  grid-cols-1          // Mobile: 1 column
  md:grid-cols-2       // Tablet: 2 columns
  lg:grid-cols-3       // Desktop: 3 columns
  gap-4                // Spacing
">
```

### Breakpoints

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

## Performance Optimization

### Code Splitting

React Router automatically code-splits routes.

### Lazy Loading

```jsx
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));

<Suspense fallback={<Loading />}>
  <Dashboard />
</Suspense>
```

### Image Optimization

Use appropriate image formats and sizes:
- SVG for icons
- WebP for images
- Lazy load images below fold

## Deployment

### Vercel (Recommended)

```bash
npm run build
vercel
```

Or connect GitHub repository to Vercel for automatic deploys.

### Netlify

```bash
npm run build
netlify deploy --prod --dir=dist
```

### Build Configuration

```js
// vite.config.js
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        }
      }
    }
  }
})
```

### Environment Variables

On deployment platforms, set:
```
VITE_API_URL=https://your-api-domain.com/api
```

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

## Accessibility

- Semantic HTML
- ARIA labels where needed
- Keyboard navigation
- Focus states
- Screen reader friendly

## Best Practices

1. **Component Organization**: One component per file
2. **Naming**: PascalCase for components, camelCase for functions
3. **Props**: Destructure props in function signature
4. **State**: Use appropriate hooks (useState, useEffect, etc.)
5. **API Calls**: Always handle errors with try-catch
6. **Loading States**: Show loading indicators for async operations
7. **Error Handling**: Display user-friendly error messages

## Troubleshooting

### Vite Port Already in Use

```bash
# Use different port
npm run dev -- --port 3000
```

### Module Not Found

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### API Connection Issues

1. Check VITE_API_URL in .env
2. Ensure backend is running
3. Check CORS settings in backend
4. Verify network tab in browser dev tools

### Build Errors

```bash
# Type check (if using TypeScript)
npx tsc --noEmit

# Clear build cache
rm -rf dist .vite
npm run build
```

## Development Tips

1. **Hot Reload**: Vite provides instant HMR
2. **Dev Tools**: Use React Developer Tools browser extension
3. **Network**: Monitor API calls in browser Network tab
4. **Console**: Check browser console for errors
5. **Tailwind**: Use Tailwind CSS IntelliSense VSCode extension

## Resources

- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/)
- [Axios Documentation](https://axios-http.com/)

## License

MIT License
