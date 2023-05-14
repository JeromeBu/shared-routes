<p align="center">
    <img src="https://user-images.githubusercontent.com/6702424/80216211-00ef5280-863e-11ea-81de-59f3a3d4b8e4.png">  
</p>

<p align="center">
    <i>
    One place to define your routes. 
    <br>Keep front, back, and documentation synchronized and type safe
    </i>
    <br>
    <br>
    <a href="https://github.com/JeromeBu/shared-routes/actions">
      <img src="https://github.com/JeromeBu/shared-routes/workflows/ci/badge.svg?branch=main">
    </a>
    <a href="https://bundlephobia.com/package/shared-routes">
      <img src="https://img.shields.io/bundlephobia/minzip/shared-routes">
    </a>
    <a href="https://www.npmjs.com/package/shared-routes">
      <img src="https://img.shields.io/npm/dw/shared-routes">
    </a>
    <a href="https://github.com/JeromeBu/shared-routes/blob/main/LICENSE">
      <img src="https://img.shields.io/npm/l/shared-routes">
    </a>
</p>
<!-- <p align="center">
  <a href="https://github.com/JeromeBu/shared-routes">Home</a>
  -
  <a href="https://github.com/JeromeBu/shared-routes">Documentation</a>
</p> -->

<p>The purpose of this library, is to provide a convenient way to share the routes definition. It is particularly convenient inside a monorepo, where you can share the routes as an internal package and than import them where needed</p>

# Install / Import

```bash
# zod is also necessary for schema definition

npm install shared-routes
npm install zod
# or
yarn add shared-routes
yarn add zod
# or
pnpm install shared-routes
pnpm install zod
```

## Create your route definitions

```typescript
import { defineRoutes, defineRoute } from "shared-routes";

type Book = { title: string; author: string };
const bookSchema: z.Schema<Book> = z.object({
  title: z.string(),
  author: z.string(),
});

export const routes = defineRoutes({
  addBook: defineRoute({
    method: "post",
    url: "/books",
    requestBodySchema: bookSchema,
  }),
  getAllBooks: defineRoute({
    method: "get",
    url: "/books",
    queryParamsSchema: z.object({ max: z.number() }),
    responseBodySchema: z.array(bookSchema),
  }),
  getBookByTitle: defineRoute({
    method: "get",
    url: "/books/:title",
    headersSchema: z.object({ authorization: z.string() }),
    responseBodySchema: z.union([bookSchema, z.undefined()]),
  }),
});
```
