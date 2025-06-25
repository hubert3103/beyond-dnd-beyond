
# D&D 5e Character Manager

A comprehensive web application for creating, managing, and playing D&D 5th Edition characters. Built with modern web technologies and integrated with official D&D 5e data through the Open5e API.
![image](https://github.com/user-attachments/assets/8f7174ea-2c7e-42f1-8db8-332082e1e49c)

## 🎲 Features

### Character Creation
- **Multi-step character creation wizard** with intuitive navigation
- **Species selection** with detailed information and racial traits
- **Class selection** with subclass options and spellcasting abilities
- **Ability score generation** with multiple methods:
  - Standard Array (15, 14, 13, 12, 10, 8)
  - Point Buy system with customizable point allocation
  - Manual entry for custom campaigns
- **Background selection** with associated skills and equipment
- **Spell selection** for spellcasting classes with level-appropriate options
- **Equipment management** with starting gear and inventory tracking

### Character Management
- **Interactive character sheets** with live calculations
- **Level progression** with automatic hit points, proficiency bonus, and spell slot updates
- **Ability Score Improvements** and feat selection during level-up
- **Rest mechanics** (short and long rests) with resource recovery
- **Spell management** with spell slot tracking and casting
- **Equipment and inventory** with weight calculations and currency tracking
- **Notes and backstory** sections for roleplay elements

### Game Resources
- **Comprehensive spell database** with 400+ spells from official sources
- **Equipment catalog** with 650+ items including weapons, armor, and magic items
- **Monster Manual integration** (planned feature)
- **Rule references** and quick lookup tools

### User Experience
- **Multilingual support** (English, Dutch, Polish) (Still in development)
- **Responsive design** optimized for desktop and mobile devices
- **Dark/light theme** support

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: React Context API with custom hooks
- **Database**: Supabase (PostgreSQL) with real-time subscriptions
- **Authentication**: Supabase Auth with session management
- **Data Source**: Open5e API for official D&D 5e content
- **Routing**: React Router DOM for navigation
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React icon library

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account for backend services

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dnd-character-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Run the provided SQL migrations to set up the database schema
   - Configure authentication settings

4. **Configure environment variables**
   - Set up Supabase URL and API keys in your environment
   - Configure any additional API keys if needed

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Open http://localhost:5173 in your browser
   - Select your preferred language
   - Create an account or log in

## 📊 Database Schema

### Core Tables

- **`characters`** - Character data with JSON fields for complex structures
- **`profiles`** - User profile information linked to authentication
- **`open5e_spells`** - Comprehensive spell database from Open5e API
- **`open5e_equipment`** - Equipment and items from Open5e API
- **`open5e_races`** - Species/race data with traits and abilities
- **`open5e_classes`** - Class information with proficiencies and features
- **`open5e_backgrounds`** - Character backgrounds with skills and equipment

### Key Features

- **Row Level Security (RLS)** for data protection
- **Real-time updates** with Supabase subscriptions
- **JSON fields** for flexible character data storage
- **Automatic triggers** for user profile creation
- **Optimized queries** for performance

## 🏗️ Architecture

### Component Structure

```
src/
├── components/
│   ├── character-creation/     # Character creation wizard steps
│   ├── character-sheet/        # Interactive character sheet components
│   ├── tabs/                   # Main dashboard tabs (Characters, Spells, Items)
│   └── ui/                     # Reusable UI components (shadcn/ui)
├── pages/                      # Main application pages
├── hooks/                      # Custom React hooks for data management
├── contexts/                   # React contexts for global state
├── services/                   # External API services and utilities
├── data/                       # Static data and constants
└── integrations/               # Third-party integrations (Supabase)
```

### State Management

- **Authentication Context** - Global user authentication state
- **Language Context** - Internationalization and language preferences (in progress)
- **Custom Hooks** - Data fetching and character management logic
- **Local State** - Component-specific state management

### Data Flow

1. **Authentication** - Supabase Auth with automatic profile creation
2. **Character Data** - Hybrid approach combining local data and Open5e API
3. **Real-time Updates** - Supabase subscriptions for live character updates
4. **Caching Strategy** - Intelligent caching for API responses and user data

## Usage Guide

### Creating a Character

1. **Setup** - Choose name, rule sources, and advancement options
2. **Species** - Select race/species with racial traits
3. **Class** - Choose class and subclass options
4. **Abilities** - Assign ability scores using preferred method
5. **Background** - Select background for skills and equipment
6. **Spells** - Choose spells for spellcasting classes
7. **Equipment** - Manage starting equipment and inventory
8. **Summary** - Review and finalize character creation

### Playing with Your Character

- **Character Sheet** - View and manage all character statistics
- **Level Up** - Advance your character with guided level progression
- **Spell Casting** - Track spell slots and manage known spells
- **Rest Management** - Take short and long rests to recover resources
- **Equipment** - Manage inventory, currency, and magical items
- **Notes** - Keep track of story elements and character development

### Managing Multiple Characters

- **Character List** - View all your created characters
- **Quick Actions** - Fast access to character sheets and editing
- **Search and Filter** - Find characters quickly
- **Backup and Sync** - Automatic cloud synchronization

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for code formatting
- **Component-driven** development approach
- **Custom hooks** for business logic separation

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📚 API Integration

### Open5e API

The application integrates with the Open5e API to provide official D&D 5e content:

- **Spells** - Complete spell database with search and filtering
- **Equipment** - Weapons, armor, and magic items
- **Races** - Player character races and subraces
- **Classes** - Character classes with features and proficiencies
- **Backgrounds** - Character backgrounds and their benefits

### Data Management

- **Hybrid Approach** - Combines local data with API responses
- **Intelligent Caching** - Reduces API calls and improves performance
- **Real-time Sync** - Character data synchronized across devices

## Security

- **Authentication** - Secure user authentication with Supabase
- **Authorization** - Row-level security for data access
- **Data Validation** - Input validation with Zod schemas
- **HTTPS** - Secure connections for all data transfer
- **Session Management** - Automatic token refresh and secure storage

## Mobile Support

- **Responsive Design** - Optimized for mobile devices
- **Touch Interface** - Mobile-friendly interactions
- **Offline Mode** - Core features work without internet
- **Progressive Web App** - Can be installed on mobile devices

## Roadmap

### Planned Features

- **Campaign Management** - Tools for Dungeon Masters
- **Party Management** - Group character coordination
- **Digital Dice** - Integrated dice rolling with character modifiers
- **Combat Tracker** - Initiative and combat management
- **Character Templates** - Pre-built character archetypes
- **Advanced Search** - Enhanced filtering and search capabilities
- **Character Portraits** - Image upload and management
- **Homebrew Content** - Custom races, classes, and items

### Technical Improvements

- **Performance Optimization** - Faster loading and better caching
- **Enhanced Offline Support** - Full offline character management
- **Better Error Handling** - Improved user experience during errors
- **Advanced Analytics** - Usage tracking and optimization insights

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- **Wizards of the Coast** for creating D&D 5th Edition
- **Open5e** for providing the API and open-source D&D content
- **Supabase** for the backend infrastructure
- **shadcn/ui** for the beautiful component library
- **Tailwind CSS** for the utility-first CSS framework


---

**Happy adventuring!** 🗡️✨
