# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

- Provides an unstyled `index.css` for a raw starting point
- ESLint configured for code quality

## Development Setup

1. `npm install`
2. Create `.env.local` by copying `.env.example` and filling in Supabase keys.
3. `npm run dev`

## Deployment
Please see [DEPLOYMENT.md](./DEPLOYMENT.md) for full instructions on deploying this project to Vercel, including:
- Production environment variables setup
- Client-side routing rewrites (`vercel.json`)
- Post-deployment Smoke Testing

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
