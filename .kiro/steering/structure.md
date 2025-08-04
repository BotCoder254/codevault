# Project Structure

## Root Directory
```
├── .kiro/              # Kiro AI assistant configuration
├── .svelte-kit/        # SvelteKit generated files (auto-generated)
├── node_modules/       # Dependencies (auto-generated)
├── src/                # Source code
├── static/             # Static assets
├── package.json        # Project dependencies and scripts
├── svelte.config.js    # SvelteKit configuration
├── vite.config.js      # Vite build configuration
├── jsconfig.json       # JavaScript/TypeScript configuration
└── README.md           # Project documentation
```

## Source Directory (`src/`)
```
src/
├── app.html            # HTML template for the application
├── app.css             # Global styles (Tailwind imports)
├── app.d.ts            # Global type definitions
├── lib/                # Reusable components and utilities
│   ├── assets/         # Asset files
│   └── index.js        # Library exports
└── routes/             # SvelteKit file-based routing
    ├── +layout.svelte  # Root layout component
    └── +page.svelte    # Home page component
```

## Key Conventions

### File Naming
- **Routes**: Use `+page.svelte` for pages, `+layout.svelte` for layouts
- **Components**: Use PascalCase for component files (e.g., `MyComponent.svelte`)
- **Utilities**: Use camelCase for JavaScript/TypeScript files

### Import Patterns
- Use `$lib` alias for importing from `src/lib/`
- Global styles imported in `app.css` using `@import "tailwindcss"`
- Components should be placed in `src/lib/` for reusability

### Styling Approach
- Tailwind CSS classes for styling
- Global styles minimal, component-scoped styles preferred
- Use Tailwind utilities over custom CSS when possible

### SvelteKit Conventions
- File-based routing in `src/routes/`
- Layout hierarchy using `+layout.svelte` files
- Server-side functionality via `+page.server.js` files (when needed)
- Type safety through JSDoc comments and `app.d.ts`