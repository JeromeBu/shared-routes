# Install

shared-routes depends on `zod`, for contrat definition, so it needs to be installed with shared-routes

```bash
# with npm
npm install shared-routes
npm install zod

# with pnpm
pnpm install shared-routes
pnpm install zod

# with yarn
yarn add shared-routes
yarn add zod
```

If you are willing to use the OpenAPI module (to generate your swagger documentation), you will need an extra peer dependency `zod-to-json-schema` :&#x20;

```sh
npm install zod-to-json-schema
# or
pnpm install zod-to-json-schema
# or
yarn add zod-to-json-schema
```

