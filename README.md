# Amateur Cycling Stats UI

A SvelteKit application for managing amateur cycling statistics, migrated from a Next.js application.

## Migration Status

### ✅ Completed

- **Project Structure**: Set up SvelteKit project with proper directory structure
- **Type Definitions**: Migrated all TypeScript interfaces and types
  - Event, Race, Cyclist entities
  - Race categories, genders, lengths collections
  - Race results and ranking points
- **Services Layer**: Migrated API service functions
  - Events service with future/past events fetching
- **State Management**: Converted Zustand stores to Svelte stores
  - Alert store for global notifications
- **Core Pages**: Basic home page displaying upcoming events

### 🔄 In Progress

- **Authentication**: User login/signup functionality
- **Additional Pages**: Cyclists, results, rankings, teams pages
- **Internationalization**: Multi-language support (Spanish/English)
- **UI Components**: Header, navigation, and form components

### 📋 Remaining

- **Authentication Flow**: Login, signup, and user management
- **Event Management**: Detailed event pages and results
- **Cyclist Profiles**: Individual cyclist pages and statistics
- **Team Management**: Team pages and member management
- **Responsive Design**: Mobile-first responsive layouts
- **Testing**: Unit and integration tests

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create environment file:

   ```bash
   cp .env.example .env
   ```

   Update the `VITE_SERVICE_URL` to point to your API server.

3. Start development server:
   ```bash
   npm run dev
   ```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - TypeScript and Svelte checking
- `npm run test` - Run tests

## Architecture

### Project Structure

```
src/
├── lib/
│   ├── services/     # API service functions
│   ├── types/        # TypeScript definitions
│   ├── stores/       # Svelte stores for state management
│   └── constants/    # Application constants
├── routes/           # SvelteKit file-based routing
└── app.html         # HTML template
```

### Key Features

- **Svelte 5**: Latest Svelte with runes and improved reactivity
- **TypeScript**: Full type safety
- **Tailwind CSS**: Utility-first styling
- **Svelte Stores**: Reactive state management
- **Vite**: Fast build tool and development server

## Migration Notes

This application was migrated from a Next.js React application. Key changes include:

- **Framework**: Next.js → SvelteKit
- **State Management**: Zustand → Svelte Stores
- **Styling**: Material-UI → Tailwind CSS
- **Routing**: App Router → File-based routing
- **Components**: React JSX → Svelte templates

The migration maintains the same API contracts and data structures while leveraging Svelte's compile-time optimizations and simpler reactivity model.
