# Technology Stack

## Core Framework
- **SvelteKit 2.22.0** - Full-stack web framework
- **Svelte 5.0.0** - Component framework
- **Vite 7.0.4** - Build tool and dev server

## Styling
- **Tailwind CSS 4.1.11** - Utility-first CSS framework
- **@tailwindcss/vite** - Vite integration for Tailwind

## Development Tools
- **TypeScript 5.0.0** - Type checking (via JSDoc)
- **svelte-check** - Svelte type checking
- **@sveltejs/adapter-auto** - Automatic deployment adapter

## Build System
- **Vite** - Primary build tool
- **ES Modules** - Module system (type: "module")
- **JSConfig** - JavaScript configuration with TypeScript checking

## Common Commands

### Development
```bash
npm run dev          # Start development server
npm run dev -- --open  # Start dev server and open browser
```

### Building & Deployment
```bash
npm run build        # Create production build
npm run preview      # Preview production build locally
```

### Code Quality
```bash
npm run check        # Run Svelte type checking
npm run check:watch  # Run type checking in watch mode
npm run prepare      # Sync SvelteKit (runs automatically)
```

## Project Configuration
- Uses `jsconfig.json` for JavaScript/TypeScript configuration
- Vite config includes Tailwind and SvelteKit plugins
- Adapter-auto handles deployment to various platforms automatically