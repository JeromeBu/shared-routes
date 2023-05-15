---
description: This will be the source of truth of your routes
---

# Defining routes

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
    responseBodySchema: bookSchema.or(z.void()),
  }),
});
```

### Use it where needed

You can now take advantage of the routes definitions with many different adapters:

* [Fetch (browser or node-fetch)](fetch-browser-or-node-fetch.md)
* Axios
* Express
* Supertest
* OpenAPI
