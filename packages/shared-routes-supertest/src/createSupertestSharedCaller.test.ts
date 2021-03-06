import { defineRoute, definePrefixedRoute } from "shared-routes";
import { createExpressSharedRouter } from "shared-routes-express";
import { z } from "zod";
import { createSupertestSharedCaller } from "./createSupertestSharedCaller";
import supertest from "supertest";
import express from "express";
import bodyParser from "body-parser";
import { Router } from "express";

const zNumberFromString = z.preprocess((v: any) => {
  const n = parseInt(v);
  return isNaN(n) ? v : n;
}, z.number());

type Book = { title: string; author: string };
const bookSchema: z.Schema<Book> = z.object({
  title: z.string(),
  author: z.string(),
});

const mySharedRoutes = definePrefixedRoute("/books", {
  addBook: defineRoute({
    verb: "post",
    path: "/",
    bodySchema: bookSchema,
  }),
  getAllBooks: defineRoute({
    verb: "get",
    path: "/",
    querySchema: z.object({ max: zNumberFromString }),
    outputSchema: z.array(bookSchema),
  }),
  getBookByTitle: defineRoute({
    verb: "get",
    path: `/books/:title`,
    outputSchema: z.union([bookSchema, z.undefined()]),
  }),
});

const fakeAuthToken = "my-token";

const createExempleApp = () => {
  const app = express();
  app.use(bodyParser.json());

  const bookDB: Book[] = [];

  const expressRouter = Router();

  const { sharedRouter: expressSharedRouter, pathPrefix } =
    createExpressSharedRouter(mySharedRoutes, expressRouter, {
      withQueryValidation: true,
    });

  expressSharedRouter.getAllBooks((req, res) => {
    console.log("max", req.query.max);
    console.log("typeof max", typeof req.query.max); // TODO type is wrong here, expecting number from schema but i am guessing query params are always converted to string
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

  app.use(pathPrefix, expressRouter);
  return app;
};

describe("createExpressSharedRouter and createSupertestSharedCaller", () => {
  it("fails to add if not authenticated", async () => {
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
    });
    expect(addBookResponse.body).toEqual(""); // type is void, but express sends "";
    expect(addBookResponse.status).toBe(401);
  });

  it("fails explicitly when the schema is not respected", async () => {
    const app = createExempleApp();
    const supertestRequest = supertest(app);
    const supertestSharedCaller = createSupertestSharedCaller(
      mySharedRoutes,
      supertestRequest
    );

    const getAllBooksResponse = await supertestSharedCaller.getAllBooks({
      body: undefined,
      query: { max: "yolo" as any },
      params: {},
    });
    expect(getAllBooksResponse.body).toEqual([
      "max : Expected number, received string",
    ]);
    expect(getAllBooksResponse.status).toBe(400);
  });

  it("create an express app and a supertest instance with the same sharedRoutes object", async () => {
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

    expect(addBookResponse.body).toEqual(""); // type is void, but express sends "";
    expect(addBookResponse.status).toBe(200);

    const otherBook: Book = { title: "Other book", author: "Somebody" };
    await supertestSharedCaller.addBook({
      body: otherBook,
      query: undefined,
      params: {},
      headers: { authorization: fakeAuthToken },
    });

    const getAllBooksResponse = await supertestSharedCaller.getAllBooks({
      body: undefined,
      query: { max: 5 },
      params: {},
    });
    expectToEqual(getAllBooksResponse.body, [heyBook, otherBook]);
    expect(getAllBooksResponse.status).toBe(200);

    const fetchedBookResponse = await supertestSharedCaller.getBookByTitle({
      body: undefined,
      query: undefined,
      params: { title: "Hey" },
    });
    expectToEqual(fetchedBookResponse.body, heyBook);
    expect(fetchedBookResponse.status).toBe(200);
  });
});

const expectToEqual = <T>(actual: T, expected: T) =>
  expect(actual).toEqual(expected);
