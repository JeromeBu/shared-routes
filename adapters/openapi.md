---
description: Generate your documentation directly from your routes
---

# OpenAPI

You can take create your openAPI spec from your routes. You can still provide extra documentation, like you would. But you get the type safety if the contracts changes.

### Example

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
      // summary: "To add a book",
      // description: "To add a book",
      extraDocs: {
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
      // summary: "To get all books",
      // description: "To get all books",
      extraDocs: {
        queryParams: {
          authorContains: { example: "Tolkien" },
          titleContains: { example: "rings" },
        },
      },
    },
  },
});
```
