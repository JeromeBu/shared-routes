---
description: This will be the source of truth of your routes
---

# Defining routes

A full exemple of [a monorepo using pnpm workspaces can be found here](https://github.com/JeromeBu/shared-routes-demo).

### API

`shared-routes` exposes 2 functions for defining routes, that should be used together

#### defineRoutes

It takes a record of routes as the only argument. And it returns the same thing.

A validation is run to make sure you do not define twice a route with the same `method` and `url.`

```typescript
type DefineRoutes = <T extends Record<string, SharedRoutes>>(routes: T) => T
```

#### defineRoute

Very usefull to create routes, and is necessary to insure good type inference. The parameters are given as an object, with the following keys:

```typescript
type DefineRouteParams = {
    // method and url are required
    method: "get" | "post" | "put" | "patch" | "delete",
    url: string // must be a relative ('/something') or absolute url ('https://placeholder.com')
    
    // the following are optionnal, and will be considered void if not provided
    requestBodySchema: z.Schema<RequestBody>,
    queryParamsSchema: z.Schema<QueryParams>,
    headersSchema: z.Schema<Headers>,
    responseBodySchema: z.Schema<ResponseBody>,
}
```

It is important to note that all the type safety and inference will comme from these definitions. It is important that they are accurate. `RequestBody`, `QueryParams`, `Headers` and `ResponseBody` are directly infered from the zod schemas.

### Example

The whole documentation will be referencing the following route definitions&#x20;

```typescript
import { defineRoute, defineRoutes } from "shared-routes";
import { z } from "zod";

const bookSchema = z.object({
  id: z.string(),
  title: z.string(),
  author: z.string(),
});
type Book = z.infer<typeof bookSchema>;

export const bookRoutes = defineRoutes({
  getBooks: defineRoute({
    // you have to define the method and the url :
    method: "get",
    url: "/books", // can be absolute or relative
    // you can define the query params, and the response body :
    queryParamsSchema: z.object({
      titleContains: z.string().optional(),
      authorContains: z.string().optional(),
    }),
    responseBodySchema: z.array(bookSchema), // if no schema is provided, the response body will be void
  }),

  addBook: defineRoute({
    method: "post",
    url: "/books",
    // you can define specific headers :
    headersSchema: z.object({
      authorization: z.string(),
    }),
    // you can define the request body :
    requestBodySchema: z.object({
      title: z.string(),
      author: z.string(),
    }),
    responseBodySchema: z.object({
      bookId: z.number(),
    }),
  }),
  
  // you can also define the path params :
  getBookById: defineRoute({
    method: "get",
    url: "/books/:bookId",
    responseBodySchema: bookSchema.or(z.undefined()),
  }),
});
```

### Use it where needed

You can now take advantage of the routes definitions with many different adapters:

* [Fetch (browser or node-fetch)](adapters/fetch-browser-or-node-fetch.md)
* [Axios](adapters/axios.md)
* [Express](adapters/express.md)
* [Supertest](adapters/supertest.md)
* [OpenAPI](adapters/openapi.md)
