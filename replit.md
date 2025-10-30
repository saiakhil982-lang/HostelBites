# HostelBites - Meal Tracker

## Overview

HostelBites is a real-time meal attendance tracking application designed for hostel environments. The system allows residents to mark their attendance for three daily meals (Breakfast, Lunch, and Dinner) with live updates, search functionality, and visual celebrations. The application features a warm, community-focused design with automatic daily resets, CSV export capabilities, and both light and dark mode support.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18+ with TypeScript as the core framework
- Vite as the build tool and development server
- Wouter for client-side routing (lightweight alternative to React Router)

**UI Component System**
- Built on Radix UI primitives for accessible, unstyled components
- shadcn/ui component library following "New York" style configuration
- Tailwind CSS for styling with custom theme extensions
- Poppins font family from Google Fonts for friendly, modern typography

**State Management Strategy**
- TanStack Query (React Query) for server state management with 5-second polling for live updates
- Local React state (`useState`) for UI interactions and form inputs
- localStorage for persisting tutorial visibility state

**Design System Decisions**
- Custom color palette with meal-specific accent colors (coral pink for Breakfast, lavender for Lunch, mint for Dinner)
- Gradient backgrounds in both light and dark modes for visual appeal
- Semi-transparent cards with blur effects for depth
- Design principles emphasize warmth, playfulness, and instant clarity

**Key Interactive Features**
- Confetti celebrations using canvas-confetti library when users vote
- Real-time status updates via polling (5-second intervals)
- Search-based name selection with instant filtering
- Tutorial modal for first-time users (localStorage-based display control)
- Two-column layout showing "Who Ate" and "Not Eaten Yet" for each meal

### Backend Architecture

**Server Framework**
- Express.js server running on Node.js
- ESM (ES Modules) module system throughout
- TypeScript for type safety across client and server

**Data Persistence Pattern**
- File-based JSON storage for simplicity and portability
- `data.json` stores meal attendance records and last reset timestamp
- `names.json` contains the preset list of hostel residents
- MemStorage class abstracts storage operations with async interface
- Automatic daily reset logic based on date comparison

**Note on Database Configuration**
- Drizzle ORM and PostgreSQL schema files are present in the codebase
- Current implementation uses file-based storage, not PostgreSQL
- Database configuration exists for potential future migration to persistent database

**API Design**
RESTful endpoints following clear resource patterns:
- `GET /api/status` - Returns current meal status with eaten/not-eaten lists and counts
- `POST /api/vote` - Records meal attendance (requires name and meal type)
- `POST /api/reset/:meal` - Resets specific meal section
- `POST /api/reset-all` - Resets all three meals
- `GET /api/preset-names` - Returns list of all residents
- `GET /api/export-csv` - Exports attendance data in CSV format
- `GET /api/backup-files` - Downloads complete backup JSON with names and data

**Data Validation**
- Zod schema validation for incoming requests (voteSchema)
- Type safety between client and server via shared schema definitions in `shared/schema.ts`

**Development Tools Integration**
- Replit-specific plugins for development experience (cartographer, dev-banner, runtime-error-modal)
- Hot module replacement (HMR) via Vite in development mode
- Request logging middleware for API endpoints

### External Dependencies

**UI Component Libraries**
- @radix-ui/* family (accordion, alert-dialog, avatar, checkbox, dialog, dropdown-menu, etc.)
- All Radix components provide unstyled, accessible primitives
- cmdk for command palette functionality

**State & Data Management**
- @tanstack/react-query for server state caching and synchronization
- react-hook-form with @hookform/resolvers for form handling
- zod for runtime type validation

**Styling & Animation**
- Tailwind CSS for utility-first styling
- class-variance-authority (cva) for variant-based component styling
- clsx and tailwind-merge for conditional class composition
- canvas-confetti for celebration animations

**Database & ORM (Configured but Not Active)**
- drizzle-orm for type-safe database queries
- @neondatabase/serverless for PostgreSQL connection
- drizzle-kit for schema migrations

**Build & Development Tools**
- tsx for running TypeScript files directly in Node.js
- esbuild for server-side bundling in production
- autoprefixer and postcss for CSS processing
- @replit/vite-plugin-* for Replit-specific development features

**Utilities**
- date-fns for date manipulation and formatting
- wouter for lightweight routing
- lucide-react for icon components

**Session Management (Available but Not Used)**
- connect-pg-simple for PostgreSQL session storage (configured but not actively used)