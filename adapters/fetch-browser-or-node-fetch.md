---
description: The fetch adapter, type safe
---

# Fetch (browser or node-fetch)

###

### Example

It uses the `bookRoutes` definitions [from here](../defining-routes.md#example).

```typescript
import { createFetchSharedClient } from "shared-routes/fetch";

const testingUsageWithFetch = async () => {
  // the third parameter is optional, it is for options. For now, only the baseURL is supported.
  const httpClient = createFetchSharedClient(bookRoutes, fetch, {
    baseURL: "/api",
  });

  // then you can use the client, and get the type safety :
  const getBooksResponse = await httpClient.getBooks({
    queryParams: { titleContains: "Harry potter" }, // type matches the queryParamsSchema
  });

  getBooksResponse.body; // type is : Book[] (matches the responseBodySchema)
  getBooksResponse.status;

  const addBookResponse = await httpClient.addBook({
    body: { title: "Lord Of The Rings", author: "Tolkien" },
    headers: { authorization: "my-token" },
  });

  addBookResponse.body; // type is { bookId: number } (matches the responseBodySchema)
  addBookResponse.status;

  const getBookByIdResponse = await httpClient.getBookById({
    urlParams: { bookId: "abc" }, // bookId is comming from the name of the path param
  });

  getBookByIdResponse.status; // type is 200 | 404 (matches the responses)

  if (getBookByIdResponse.status === 404) {
    getBookByIdResponse.body; // type is void (matches the response -> 404)
  } else {
    getBookByIdResponse.status; // type is 200 (matches the response -> 200)
    getBookByIdResponse.body; // type is Book (matches the response -> 200)
  }
};

```
