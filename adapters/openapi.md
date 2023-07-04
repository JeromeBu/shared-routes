---
description: Generate your documentation directly from your routes
---

# OpenAPI

You can take create your openAPI spec from your routes. You can still provide extra documentation, like you would with openAPI. But you get the type safety if the contracts changes.

### ⚠️[ ](#user-content-fn-1)[^1]Careful, a peer dependency is needed : \`zod-to-json-schema\` ⚠️

To generate OpenApi documentation, you need to install the peer dependency : `zod-to-json-schema`

```json
npm install zod-to-json-schema
# or
pnpm install zod-to-json-schema
# or
yarn add zod-to-json-schema
```

### Example

It uses the `bookRoutes` definitions [from here](../defining-routes.md#example).

```typescript
import { createOpenApiGenerator } from "shared-routes/openapi";

const generateOpenApi = createOpenApiGenerator(
  // You need to provide a key/value objects.
  // The keys will be used as the tags in the openapi document, the values will be used to provide typechecking for extra documentation.
  { Books: bookRoutes },
  {
    info: {
      title: "The Book API",
      description: "The documentation of the book API",
      version: "1",
    },
    servers: [{ url: "/api" }],
    openapi: "3.0.1",
  }
);

const openApiJSON = generateOpenApi({
  Books: {
    addBook: {
      summary: "To add a book",
      extraDocs: {
        responses: {
          "201": {
            description: "The book is successfully added",
          },
        },
        body: {
          title: "Book",
          description: "Represents a book",
          properties: {
            title: { example: "Harry Potter" },
            author: { example: "JK Rowlings" },
          },
        },
      },
    },
    getBooks: {
      summary: "To get all books",
      description: "Description : To get all books",
      extraDocs: {
        responses: {
          "200": {
            description: "The books are successfully retrieved",
          },
        },
        queryParams: {
          authorContains: { example: "Tolkien" },
          titleContains: { example: "rings" },
        },
      },
    },
    getBookById: {
      extraDocs: {
        responses: {
          "200": {
            description: "The book is successfully retrieved",
          },
          "404": {
            description: "The book is not found",
          },
        },
      },
    },
  },
});
```

[^1]: 
