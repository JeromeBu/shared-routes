---
description: The Express adapter, type safe
---

# Supertest

### Example

```typescript
import supertest from "supertest";
import { createSupertestSharedClient } from "shared-routes/supertest";
import { describe, it, expect } from "vitest";

// tiny helper to make sure the types are matching
const expectToEqual = <T>(actual: T, expected: T) =>
  expect(actual).toEqual(expected);

describe("testing book routes with supertest", () => {
  const supertestRequest = supertest(createApp());
  const request = createSupertestSharedClient(bookRoutes, supertestRequest);

  it("should add a book", async () => {
    const response = await request.addBook({
      headers: {
        authorization: "my-token",
      },
      body: {
        title: "Le compte de Monte Cristo",
        author: "Alexandre Dumas",
      },
    });

    expectToEqual(response.body, { bookId: 123 });
    expect(response.status).toBe(201);
  });

  it("should get all books", async () => {
    const response = await request.getBooks({
      queryParams: { authorContains: "dumas" },
    });

    expect(response.status).toBe(200);
    expectToEqual(response.body, [
      {
        id: "abc",
        title: "Le compte de Monte Cristo",
        author: "Alexandre Dumas",
      },
    ]);
  });

  it("should get a book by id", async () => {
    const response = await request.getBookById({
      urlParams: { bookId: "abc" },
    });

    expect(response.status).toBe(200);
    expectToEqual(response.body, {
      id: "abc",
      title: "Le compte de Monte Cristo",
      author: "Alexandre Dumas",
    });
  });
});
```
