# Aula anclademia

## Monorepo structure

The project is organized in a monorepo structure using **npm workspaces**. A compatible npm version is needed.

The project consists of 3 packages, all under the `packages` directory: `@aula-anclademia/common`, `@aula-anclademia/backend` and `@aula-anclademia/frontend`.

- **common**: small project that contains validation constants, such as min/max string lenghts, etc.
- **frontend**: web frontend built using Vue 3 + Vite. Imports **ONLY TYPES** (for easy type safety) from `backend` and depends on `common`.
- **backend**: backend built on NestJS. Exposes a REST API and a Socket.io powered gateway. Depends on `common`. Uses Prisma + MySQL for the database layer.
- **public-calendar**: small project that contains a public calendar. It is a frontend that uses the backend API.

## Getting started

The project uses `npm` as its package manager.

1. On the project root do `npm install` . This will install dependencies across all the workspaces and configure them to interact with each other (npm workspaces feature).
2. Build **common** by using `npm run build` on its folder. **This step is important since the other packages depend on it**
3. To setup frontend/backend, follow their respective instructions.
4. `npm run dev:frontend` and `npm run dev:backend` are available at the root package.
