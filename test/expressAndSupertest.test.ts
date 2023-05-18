import { defineRoute, defineRoutes, listRoutes } from "../src";
import { createExpressSharedRouter } from "../src/express";
import { z } from "zod";
import { createSupertestSharedClient } from "../src/supertest/createSupertestSharedClient";
import supertest from "supertest";
import express from "express";
import bodyParser from "body-parser";
import { Router as ExpressRouter } from "express";
import { expect, it, describe } from "vitest";

const zNumberFromString = z.preprocess((v: any) => {
  const n = parseInt(v);
  return isNaN(n) ? v : n;
}, z.number());

type Book = { title: string; author: string };
const bookSchema: z.Schema<Book> = z.object({
  title: z.string(),
  author: z.string(),
});

const withAuthorizationSchema = z.object({ authorization: z.string() });

const routes = defineRoutes({
  addBook: defineRoute({
    method: "post",
    url: "/books",
    requestBodySchema: bookSchema,
    headersSchema: withAuthorizationSchema,
  }),
  getAllBooks: defineRoute({
    method: "get",
    url: "/books",
    queryParamsSchema: z.object({ max: zNumberFromString }),
    responseBodySchema: z.array(bookSchema),
  }),
  getBookByTitle: defineRoute({
    method: "get",
    url: "/books/:title",
    responseBodySchema: bookSchema.optional(),
  }),
  getBookWithoutParams: defineRoute({
    method: "get",
    url: "/no-params",
    responseBodySchema: bookSchema.optional(),
  }),
});

const fakeAuthToken = "my-token";

const createBookRouter = (): ExpressRouter => {
  const bookDB: Book[] = [];
  const expressRouter = ExpressRouter();

  const expressSharedRouter = createExpressSharedRouter(routes, expressRouter);

  expressSharedRouter.getAllBooks((_, res) => {
    return res.json(bookDB);
  });

  expressSharedRouter.addBook((req, res) => {
    if (req.headers.authorization !== fakeAuthToken) {
      res.status(401);
      return res.json();
    }
    bookDB.push(req.body);
    return res.json();
  });

  expressSharedRouter.getBookByTitle((req, res) => {
    const book = bookDB.find((b) => b.title === req.params.title);
    return res.json(book);
  });

  expressSharedRouter.getBookWithoutParams((_, res) => {
    res.status(200).json();
  });

  return expressRouter;
};

const createExempleApp = () => {
  const app = express();
  app.use(bodyParser.json());
  app.use(createBookRouter());
  return app;
};

describe("createExpressSharedRouter and createSupertestSharedCaller", () => {
  it("fails to add if not authenticated", async () => {
    const app = createExempleApp();
    const supertestRequest = supertest(app);
    const supertestSharedCaller = createSupertestSharedClient(routes, supertestRequest);

    const heyBook: Book = { title: "Hey", author: "Steeve" };
    const addBookResponse = await supertestSharedCaller.addBook({
      body: heyBook,
      headers: { authorization: "not-the-right-token" },
    });
    expect(listRoutes(routes)).toEqual([
      "POST /books",
      "GET /books",
      "GET /books/:title",
      "GET /no-params",
    ]);

    expect(addBookResponse.body).toEqual(""); // type is void, but express sends "";
    expect(addBookResponse.status).toBe(401);
  });

  it("fails explicitly when the schema is not respected", async () => {
    const app = createExempleApp();
    const supertestRequest = supertest(app);
    const supertestSharedCaller = createSupertestSharedClient(routes, supertestRequest);

    const getAllBooksResponse = await supertestSharedCaller.getAllBooks({
      queryParams: { max: "yolo" as any },
    });
    expect(getAllBooksResponse.body).toEqual(["max : Expected number, received string"]);
    expect(getAllBooksResponse.status).toBe(400);
  });

  it("create an express app and a supertest instance with the same sharedRoutes object", async () => {
    const app = createExempleApp();
    const supertestRequest = supertest(app);
    const supertestSharedCaller = createSupertestSharedClient(routes, supertestRequest);

    const heyBook: Book = { title: "Hey", author: "Steeve" };
    const addBookResponse = await supertestSharedCaller.addBook({
      body: heyBook,
      headers: { authorization: fakeAuthToken },
    });

    expect(addBookResponse.body).toEqual(""); // type is void, but express sends "";
    expect(addBookResponse.status).toBe(200);

    const otherBook: Book = { title: "Other book", author: "Somebody" };
    await supertestSharedCaller.addBook({
      body: otherBook,
      headers: { authorization: fakeAuthToken },
    });

    const getAllBooksResponse = await supertestSharedCaller.getAllBooks({
      queryParams: { max: 5 },
    });
    expectToEqual(getAllBooksResponse.body, [heyBook, otherBook]);
    expect(getAllBooksResponse.status).toBe(200);

    const fetchedBookResponse = await supertestSharedCaller.getBookByTitle({
      urlParams: { title: "Hey" },
    });
    expectToEqual(fetchedBookResponse.body, heyBook);
    expect(fetchedBookResponse.status).toBe(200);

    // should compile without having to provide any params
    const { body, status } = await supertestSharedCaller.getBookWithoutParams();
    expect(body).toBe(""); // express returns "" for void
    expect(status).toEqual(200);
  });
});

const expectToEqual = <T>(actual: T, expected: T) => expect(actual).toEqual(expected);

// type Book = { title: string; author: string };
// const bookSchema: z.Schema<Book> = z.object({
//   title: z.string(),
//   author: z.string(),
// });

export const _routes = defineRoutes({
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

// const expressRouter = new
// const expressSharedRouter = createExpressSharedRouter(_routes, express.Router()).expressSharedRouter;
