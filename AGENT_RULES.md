# Agent Development Rules

## Critical Development Guidelines

### App Directory Requirement

**ALL new development and refactoring for the new project MUST take place inside the `src/app` directory.**

- The `src/template-pages` directory is **legacy/template code** and should remain unchanged unless explicitly required for compatibility
- All new features, routes, and components should be implemented in the `src/app` directory using Next.js App Router conventions
- The existing `src/template-pages` directory serves as reference/template code only

### Development Patterns

1. **New Routes**: Create new routes in `src/app` following Next.js App Router file conventions:
   - `src/app/page.tsx` - Root route
   - `src/app/[route]/page.tsx` - Nested routes
   - `src/app/layout.tsx` - Root layout (already exists)

2. **Shared Components**: Reuse existing components from:
   - `src/@core/components/` - Core UI components
   - `src/views/` - View components
   - `src/layouts/` - Layout components

3. **Client vs Server Components**: 
   - Use `'use client'` directive for components that require interactivity, hooks, or browser APIs
   - Server components are the default in the App Router

4. **Migration Strategy**: 
   - When refactoring features from `template-pages` to `app`, create new implementations in `app` directory
   - Do NOT move or delete files from `src/template-pages` unless explicitly requested
   - Both routing systems can coexist during the migration period

### Project Structure

```
src/
├── app/                  ← NEW DEVELOPMENT GOES HERE
│   ├── layout.tsx        ← Root layout with providers
│   ├── page.tsx          ← Root page (login screen)
│   └── providers.tsx     ← Client-side providers
└── template-pages/       ← TEMPLATE/LEGACY - DO NOT MODIFY FOR NEW FEATURES
    └── ...               ← Existing pages router code (template reference)
```

### Important Notes

- The root route (`/`) now serves the login page from `src/app/page.tsx`
- Legacy routes in `src/template-pages` continue to work (e.g., `/pages/auth/login-v1`) but are template/reference code
- Always check this file before starting any development work
- When in doubt, implement in `src/app` directory

---

**This file must be read and followed by all agents working on this project.**

