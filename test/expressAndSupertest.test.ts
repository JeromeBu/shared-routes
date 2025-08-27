import bodyParser from "body-parser";
import express, { Router as ExpressRouter } from "express";
import supertest from "supertest";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { defineRoute, defineRoutes, listRoutes } from "../src";
import { createExpressSharedRouter } from "../src/express";
import type { ExpressSharedRouterOptions } from "../src/express/createExpressSharedRouter";
import type { StandardSchemaV1 } from "../src/standardSchemaUtils";
import { createSupertestSharedClient } from "../src/supertest/createSupertestSharedClient";

type Book = z.Infer<typeof bookSchema>;
const bookSchema = z.object({
  title: z.string(),
  author: z.string(),
});

const withAuthorizationSchema = z.object({ authorization: z.string() });

const testUnionSchema = z.union([
  z.object({ type: z.literal("A"), value: z.string() }),
  z.object({ type: z.literal("B"), count: z.number() }),
]);

const maxSchema: z.ZodType<number, string | number> = z.coerce.number<string | number>();

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
    queryParamsSchema: z.object({
      max: maxSchema,
      startWith: z.array(z.string()),
    }),
    responses: { 200: z.array(bookSchema) },
  }),
  getBookByTitle: defineRoute({
    method: "get",
    url: "/books/:title",
    responses: {
      200: bookSchema,
      404: z.object({ message: z.string() }),
    },
  }),
  getBookWithoutParams: defineRoute({
    method: "get",
    url: "/no-params",
    responses: { 200: bookSchema.optional() },
  }),
  addComplexItem: defineRoute({
    method: "post",
    url: "/complex-item",
    requestBodySchema: testUnionSchema,
    headersSchema: withAuthorizationSchema,
  }),
});

const fakeAuthToken = "my-token";

type WithExpressSharedRouterOptions = {
  expressSharedRouterOptions: ExpressSharedRouterOptions;
};

const createBookRouter = (
  config: WithExpressSharedRouterOptions | void,
): ExpressRouter => {
  const bookDB: Book[] = [];
  const expressRouter = ExpressRouter();

  const expressSharedRouter = createExpressSharedRouter(
    routes,
    expressRouter,
    config?.expressSharedRouterOptions,
  );

  const someMiddleware: express.RequestHandler = (_req, _res, next) => {
    next();
  };

  expressSharedRouter.getAllBooks((req, res) => {
    req.query.max;
    return res.json(bookDB);
  });

  expressSharedRouter.addBook(someMiddleware, (req, res) => {
    if (req.headers.authorization !== fakeAuthToken) {
      res.status(401);
      return res.json();
    }
    bookDB.push(req.body);
    return res.json();
  });

  expressSharedRouter.getBookByTitle((req, res) => {
    if (req.params.title === "throw") throw new Error("Some unexpected error");

    const book = bookDB.find((b) => b.title === req.params.title);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    return res.status(200).json(book);
  });

  expressSharedRouter.getBookWithoutParams((_, res) => {
    res.status(200).json();
  });

  expressSharedRouter.addComplexItem(someMiddleware, (req, res) => {
    if (req.headers.authorization !== fakeAuthToken) {
      res.status(401);
      return res.json();
    }
    return res.json();
  });

  return expressRouter;
};

const createExempleApp = (config: WithExpressSharedRouterOptions | void) => {
  const app = express();
  app.use(bodyParser.json());
  app.use(createBookRouter(config));
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
      "POST /complex-item",
    ]);

    expect(addBookResponse.body).toEqual(""); // type is void, but express sends "";
    expect(addBookResponse.status).toBe(401);
  });

  it("fails explicitly when the schema is not respected", async () => {
    const app = createExempleApp();
    const supertestRequest = supertest(app);
    const supertestSharedCaller = createSupertestSharedClient(routes, supertestRequest);

    const getAllBooksResponse = await supertestSharedCaller.getAllBooks({
      queryParams: { max: "yolo" } as any,
    });
    expect(getAllBooksResponse.body).toEqual({
      status: 400,
      message:
        "Shared-route schema 'queryParamsSchema' was not respected in adapter 'express'.\nRoute: GET /books",
      issues: [
        "max : Invalid input: expected number, received NaN",
        "startWith : Invalid input: expected array, received undefined",
      ],
    });
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
      queryParams: { max: "5", startWith: ["yolo"] },
    });
    expectToEqual(getAllBooksResponse.body, [heyBook, otherBook]);
    expect(getAllBooksResponse.status).toBe(200);

    const fetchedBookResponse = await supertestSharedCaller.getBookByTitle({
      urlParams: { title: "Hey" },
    });

    expectToMatch(fetchedBookResponse, {
      status: 200,
      body: heyBook,
      headers: { "content-type": "application/json; charset=utf-8" },
    });

    const bookNotFoundResponse = await supertestSharedCaller.getBookByTitle({
      urlParams: { title: "not found" },
    });

    expectToMatch(bookNotFoundResponse, {
      status: 404,
      body: { message: "Book not found" },
      headers: { "content-type": "application/json; charset=utf-8" },
    });

    // should compile without having to provide any params
    const { body, status } = await supertestSharedCaller.getBookWithoutParams();
    expect(body).toBe(""); // express returns "" for void
    expect(status).toEqual(200);
  });

  it("shows when unexpected error occurs (though it does not respect schema)", async () => {
    const app = createExempleApp();
    const supertestRequest = supertest(app);
    const supertestSharedCaller = createSupertestSharedClient(routes, supertestRequest);

    const result = await supertestSharedCaller.getBookByTitle({
      urlParams: { title: "throw" },
    });
    expect(result.status).toBe(500);
    expect((result as any).text).toContain("Some unexpected error");
  });

  describe("when providing a function onInputValidationError", () => {
    it("fails if the schema is not respected", async () => {
      const calledWith: any[] = [];
      const app = createExempleApp({
        expressSharedRouterOptions: {
          onInputValidationError: (error: StandardSchemaV1.FailureResult) => {
            calledWith.push(error);
            return error;
          },
        },
      });

      const supertestRequest = supertest(app);
      const supertestSharedCaller = createSupertestSharedClient(routes, supertestRequest);

      const response = await supertestSharedCaller.addComplexItem({
        body: {
          type: "C",
          value: "test",
        } as any,
        headers: { authorization: fakeAuthToken },
      });

      console.log({ response: JSON.stringify(response) });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 400,
        message:
          "Shared-route schema 'requestBodySchema' was not respected in adapter 'express'.\nRoute: POST /complex-item",
        issues: [
          'type : Invalid input: expected "A"',
          'type : Invalid input: expected "B"',
          "count : Invalid input: expected number, received undefined",
        ],
      });
    });

    it("supports a function that returns the original error with some extra side effect", async () => {
      const calledWith: any[] = [];
      const app = createExempleApp({
        expressSharedRouterOptions: {
          onInputValidationError: (error: StandardSchemaV1.FailureResult) => {
            calledWith.push(error);
            return error;
          },
        },
      });

      const supertestRequest = supertest(app);
      const supertestSharedCaller = createSupertestSharedClient(routes, supertestRequest);

      const getAllBooksResponse = await supertestSharedCaller.getAllBooks({
        queryParams: { max: "yolo" } as any,
      });
      expect(getAllBooksResponse.body).toEqual({
        status: 400,
        message:
          "Shared-route schema 'queryParamsSchema' was not respected in adapter 'express'.\nRoute: GET /books",
        issues: [
          "max : Invalid input: expected number, received NaN",
          "startWith : Invalid input: expected array, received undefined",
        ],
      });
      expect(getAllBooksResponse.status).toBe(400);
      expect(calledWith).toHaveLength(1);
      expect(calledWith[0].message).toBe(
        "Shared-route schema 'queryParamsSchema' was not respected in adapter 'express'.\nRoute: GET /books",
      );
      expect(calledWith[0].issues).toEqual([
        {
          code: "invalid_type",
          expected: "number",
          path: ["max"],
          message: "Invalid input: expected number, received NaN",
          received: "NaN",
        },
        {
          code: "invalid_type",
          expected: "array",
          path: ["startWith"],
          message: "Invalid input: expected array, received undefined",
        },
      ]);
    });

    it("supports a function that edits the error to execute code after input validation error", async () => {
      const app = createExempleApp({
        expressSharedRouterOptions: {
          onInputValidationError: (error: StandardSchemaV1.FailureResult, route) => ({
            route: `${route.method.toUpperCase()} ${route.url}`,
            myCustomMessage: `This is a different message, with ${error.issues.length} issues`,
            myCustomIssues: error.issues.map(({ path, message }) =>
              path ? path.join(".") + " : " + message : message,
            ),
          }),
        },
      });

      const supertestRequest = supertest(app);
      const supertestSharedCaller = createSupertestSharedClient(routes, supertestRequest);

      const getAllBooksResponse = await supertestSharedCaller.getAllBooks({
        queryParams: { max: "yolo" } as any,
      });
      expect(getAllBooksResponse.body).toEqual(
        JSON.stringify(
          {
            route: "GET /books",
            myCustomMessage: "This is a different message, with 2 issues",
            myCustomIssues: [
              "max : Invalid input: expected number, received NaN",
              "startWith : Invalid input: expected array, received undefined",
            ],
          },
          null,
          2,
        ),
      );
      expect(getAllBooksResponse.status).toBe(400);
    });
  });
});

const expectToEqual = <T>(actual: T, expected: T) => expect(actual).toEqual(expected);
const expectToMatch = <T>(actual: T, expected: Partial<T>) =>
  expect(actual).toMatchObject(expected);

// type Book = { title: string; author: string };
// const bookSchema: z.Schema<Book> = z.object({
//   title: z.string(),
//   author: z.string(),
// });

const _routes = defineRoutes({
  addBook: defineRoute({
    method: "post",
    url: "/books",
    requestBodySchema: bookSchema,
  }),
  getAllBooks: defineRoute({
    method: "get",
    url: "/books",
    queryParamsSchema: z.object({ max: z.number() }),
    responses: {
      200: z.array(bookSchema),
    },
  }),
  getBookByTitle: defineRoute({
    method: "get",
    url: "/books/:title",
    headersSchema: z.object({ authorization: z.string() }),
    responses: {
      200: bookSchema,
      404: z.object({ message: z.string() }),
    },
  }),
});
