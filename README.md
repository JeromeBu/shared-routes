# Shared routes

The purpose of this package is to provide a typesafe way to share routes between projects (using REST based queries).
The usual use case would be a project having a backend, consumed by a frontend and also by some supertest http calls tests.

The idea is to create the route definitions in one place and to use them everywhere. 

For now `express` is supported as a server.

`axios` and `supertest` are supported as callers.

## Install

You can decide to use only the packages which suits your need, you will need `shared-routes` anyways.

```shell
npm install shared-routes

# those you need :
npm install shared-routes-axios
npm install shared-routes-express
npm install shared-routes-supertest
```

## Routes definitions exemple :

Shared routes are defined like the following exemple :

```typescript
import { defineRoute, defineRoutes } from "shared-routes";
import { z } from "zod";

type Book = { title: string; author: string };
const bookSchema: z.Schema<Book> = z.object({
  title: z.string(),
  author: z.string(),
});

const mySharedRoutes = defineRoutes({
  addBook: defineRoute({
    verb: "post",
    path: "/books",
    bodySchema: bookSchema,
  }),
  getAllBooks: defineRoute({
    verb: "get",
    path: "/books",
    querySchema: z.object({ max: z.number() }),
    outputSchema: z.array(bookSchema),
  }),
  getBookByTitle: defineRoute({
    verb: "get",
    path: `/books/:title`,
    outputSchema: z.union([bookSchema, z.undefined()]),
  }),
});
```

[Zod library](https://github.com/colinhacks/zod) is used for schema definitions.
You can decide for each server / consumer if you want the actual validation to be run or if you just want to take advantage of the type. 

## Usage with express

Here is an exemple of usage with express, using the previously defined `mySharedRoutes`:

```typescript
import express, { Router } from "express";
import bodyParser from "body-parser";
import { createExpressSharedRouter } from "shared-routes-express";

const fakeAuthToken = "my-token";

const createExempleApp = () => {
  const app = express();
  app.use(bodyParser.json());

  const bookDB: Book[] = [];

  const expressRouter = Router();
  const expressSharedRouter = createExpressSharedRouter(
    mySharedRoutes,
    expressRouter,
    { withBodyValidation: true, withQueryValidation: true }
  );

  // the routes are typed for the previously defined shared-routes
  expressSharedRouter.getAllBooks((req, res) => {
    return res.json(bookDB);
  });

  expressSharedRouter.addBook((req, res) => {
    if (req.headers.authorization !== fakeAuthToken) {
      res.status(401);
      return res.json();
    }
    // req.body is of type Book
    bookDB.push(req.body); 
    return res.json();
  });

  expressSharedRouter.getBookByTitle((req, res) => {
    const book = bookDB.find((b) => b.title === req.params.title);
    // req.json only accepts type Book | undefined
    return res.json(book);
  });

  app.use(expressRouter);

  return app;
};
```

You are able to add middlewares, just as you would with a classic express router.


## Usage with supertest

Here is an exemple of usage with supertest, using the previously defined `mySharedRoutes`, and the `createExempleApp`:

```typescript
import { createSupertestSharedCaller } from "shared-routes-supertest"

const fakeAuthToken = "my-token";

const app = createExempleApp();
const supertestRequest = supertest(app);
const supertestSharedCaller = createSupertestSharedCaller(
  mySharedRoutes,
  supertestRequest
);

const heyBook: Book = { title: "Hey", author: "Steeve" };
const addBookResponse = await supertestSharedCaller.addBook({
  body: heyBook,
  query: undefined,
  params: {},
  headers: { authorization: fakeAuthToken },
});
expect(addBookResponse.status).toBe(200);

const getAllBooksResponse = await supertestSharedCaller.getAllBooks({
  body: undefined,
  query: { max: 5 },
  params: {},
});
expect(getAllBooksResponse.status).toBe(200);
// getAllBooksResponse.body is of type Book[]
expectToEqual(getAllBooksResponse.body, [heyBook]);
```

You can see the express app and the supertest exemple tested in this file :
[createSupertestSharedCaller.test.ts](https://github.com/JeromeBu/shared-routes/blob/main/packages/shared-routes-supertest/src/createSupertestSharedCaller.test.ts)

## Usage with axios

```typescript
import { createAxiosSharedCaller } from "shared-routes-axios"
import axios from "axios";

const axiosSharedCaller = createAxiosSharedCaller(mySharedRoutes, axios, {
  prefix: "/api",
});

const getAllBooksResponse = await axiosSharedCaller.getAllBooks({
  query: { max: 3 },
  body: undefined,
  params: {},
});

// getAllBooksResponse.data is of type Book[]


const getByTitleResponse = await axiosSharedCaller.getByTitle({
  query: undefined,
  body: undefined,
  params: { title: "great" },
});

// getByTitleResponse.data is of type Book | undefined
```