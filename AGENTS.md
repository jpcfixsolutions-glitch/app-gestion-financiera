# figma-make-app

JavaScript monorepo with a React frontend and an Express backend running inside Figma Make.

## Development Server

A Vite development server is **already running** on `$PORT` (default 8443). You don't need to start it manually.

- Preview URL: The user can access the running app through the preview panel
- Hot reload: Changes to source files are reflected immediately

## Project Structure

This is the canonical project structure. Start with task-relevant files below. Only follow imports or inspect other files when required, when a documented path is missing, or when the repository contradicts this guide.

- `frontend/src/main.jsx` - React entrypoint; imports `frontend/src/index.css` and mounts `frontend/src/App.jsx`
- `frontend/src/App.jsx` - Primary application component and the usual starting point for UI work
- `frontend/src/index.css` - Global CSS entrypoint and Tailwind CSS v4 import
- `frontend/index.html` - Vite HTML shell containing the `#root` element and loading `src/main.jsx`
- `frontend/vite.config.js` - Vite configuration with React, Tailwind CSS v4, and Figma Make plugins plus the `@` alias for `src`
- `backend/src/app.js` - Express application exported for local development and Vercel
- `backend/api/index.js` - Vercel serverless entrypoint
- `package.json` - Workspace scripts shared by both applications
- `.mise.toml` - Toolchain versions for Node.js and pnpm

## Dependencies

- Runtime: React 19 and React DOM 19
- Styling: Tailwind CSS v4 with the `@tailwindcss/vite` plugin
- Build tooling: Vite 8 and `@vitejs/plugin-react`
- Formatting: oxfmt

## Styling

This project uses **Tailwind CSS v4** through the `@tailwindcss/vite` plugin configured in `frontend/vite.config.js`. `frontend/src/index.css` imports Tailwind with `@import 'tailwindcss';`. Use Tailwind utility classes directly in JSX and put global CSS or Tailwind v4 theme customization in `frontend/src/index.css`. This scaffold does not need a Tailwind config file or PostCSS config.

`frontend/src/main.jsx` imports `frontend/src/index.css`, so global font wiring belongs there. Keep CSS `@import` statements first, then add any `@font-face` rules and font-family defaults.

## Code quality

- Use double quotes for strings containing apostrophes (`"We're here to help"`), or escape them in single-quoted strings. An unescaped apostrophe in a single-quoted string breaks the build.
- Ensure JSX tags are closed and braces are balanced.
- Keep application code in JavaScript (`.js`) and React components in JSX (`.jsx`); do not add TypeScript files or TypeScript-only dependencies.
- Export components as default exports.
