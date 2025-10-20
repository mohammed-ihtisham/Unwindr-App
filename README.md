# Unwindr-App

A modern Vue.js application built with Vue 3, TypeScript, Vite, Vue Router, and Pinia.

## Features

- ⚡️ **Vue 3** - Progressive JavaScript Framework
- 🔷 **TypeScript** - Type safety and better developer experience
- ⚡️ **Vite** - Next generation frontend tooling
- 🛣️ **Vue Router** - Official routing library for Vue.js
- 🍍 **Pinia** - Intuitive, type safe state management
- 🧪 **Vitest** - Blazing fast unit test framework
- 🎨 **ESLint + Prettier** - Code quality and formatting

## Project Setup

### Install Dependencies

```sh
npm install
```

### Development Server

Start the development server with hot-reload:

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with Vitest

```sh
npm run test:unit
```

### Lint and Fix Files

```sh
npm run lint
```

### Format Code

```sh
npm run format
```

## Project Structure

```
unwindr-app/
├── public/           # Static assets
├── src/
│   ├── assets/       # CSS, images, fonts
│   ├── components/   # Vue components
│   ├── router/       # Vue Router configuration
│   ├── stores/       # Pinia stores
│   ├── views/        # Page components
│   ├── App.vue       # Root component
│   └── main.ts       # Application entry point
├── index.html        # HTML entry point
├── vite.config.ts    # Vite configuration
└── tsconfig.json     # TypeScript configuration
```

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.
