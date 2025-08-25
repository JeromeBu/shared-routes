# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package Manager

This project uses **pnpm 10.9.x** as the package manager. The version is enforced via:
- `packageManager` field in package.json
- `engines` field requiring `^10.9.0`  
- `.npmrc` with `engine-strict=true`

## Development Commands

- **Build**: `pnpm build` - Builds both CJS and ESM versions
  - `pnpm build:cjs` - TypeScript compilation for CommonJS
  - `pnpm build:esm` - TypeScript compilation for ESM with js2mjs conversion
- **Watch**: `pnpm watch` - Runs both CJS and ESM builds in watch mode
- **Test**: `pnpm test` - Runs tests with Vitest
- **Type Check**: `pnpm typecheck` - TypeScript type checking without emitting
- **Lint & Format**: 
  - `pnpm lint:check` - Check for linting issues with Biome
  - `pnpm lint` - Fix linting issues automatically with Biome
  - `pnpm format:check` - Check formatting with Biome
  - `pnpm format` - Format code with Biome
- **Make Linkable**: `pnpm make-lib-linkable` - Builds and prepares for local linking

## Architecture Overview

Shared-routes is a TypeScript library that provides type-safe REST API route definitions and client/server utilities. The architecture follows a modular approach with separate integrations for different HTTP clients and server frameworks.

### Core Structure

- **`src/defineRoutes.ts`**: Central route definition system using Zod schemas for validation
- **`src/configureCreateHttpClient.ts`**: Base HTTP client configuration and types
- **`src/pathParameters.ts`**: URL path parameter handling and type extraction
- **`src/standardSchemaUtils.ts`**: Schema validation utilities compatible with StandardSchema

### Client Integrations

- **`src/axios/`**: Axios HTTP client integration
- **`src/fetch/`**: Native fetch API integration
- **`src/supertest/`**: Testing utilities with Supertest

### Server Integrations

- **`src/express/`**: Express.js router integration with validation middleware

### Additional Features

- **`src/openapi/`**: OpenAPI specification generation
- **`src/createCustomSharedClient.ts`**: Generic client creation for custom HTTP implementations

## Key Concepts

The library uses a declarative approach where routes are defined with:
- HTTP method and URL pattern
- Request/response schemas using StandardSchema (Zod compatible)
- Type-safe path parameters extracted from URL patterns
- Validation middleware for server-side implementations
- Type-safe client generation for frontend consumption

## Build System

The project uses dual-package exports supporting both CommonJS and ESM:
- Main TypeScript config builds to `dist/` (CommonJS)
- ESM config (`tsconfig.esm.json`) builds to `dist/esm/` with `.mjs` extensions
- Package exports defined in `package.json` for proper module resolution

## Testing

Uses Vitest with test files in `test/` directory covering:
- Route definition and validation
- Client implementations (Axios, Fetch)
- Server integration (Express, Supertest)
- OpenAPI generation