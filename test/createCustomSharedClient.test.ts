import { z } from "zod";
import { describe, it, expect } from "vitest";
import { defineRoute, defineRoutes, createCustomSharedClient } from "../src";

type Book = { title: string; author: string };
const bookSchema: z.Schema<Book> = z.object({
  title: z.string(),
  author: z.string(),
});
const withAuthorizationSchema = z.object({ authorization: z.string() });

const myRoutes = defineRoutes({
  addBook: defineRoute({
    method: "post",
    url: "/books",
    requestBodySchema: bookSchema,
    headersSchema: withAuthorizationSchema,
  }),
  getAllBooks: defineRoute({
    method: "get",
    url: "/books",
    queryParamsSchema: z.object({ max: z.number() }),
    responses: { 200: z.array(bookSchema) },
  }),
  getByTitle: defineRoute({
    method: "get",
    url: "/books/:title",
    responses: { 200: bookSchema.optional() },
  }),
});

// const books: Book[] = [];

const createTestHttpClient = () => {
  const books: Book[] = [];

  return createCustomSharedClient(myRoutes, {
    addBook: async ({ body }) => {
      books.push(body);
      return { status: 201 as const, body: undefined };
    },
    getAllBooks: async () => ({
      status: 200 as const,
      body: books,
    }),
    getByTitle: async ({ urlParams: { title } }) => ({
      status: 200 as const,
      body: books.find((book) => book.title.toLowerCase().includes(title.toLowerCase())),
    }),
  });
};

const httpClient = createTestHttpClient();

describe("createCustomSharedClient", () => {
  it("all routes work fine", async () => {
    const myBook: Book = { title: "Harry Potter", author: "J.K. Rowling" };

    const response = await httpClient.addBook({
      body: myBook,
      headers: { authorization: "my-token" },
    });
    expect(response.status).toBe(201);
    expect(response.body).toBe(undefined);

    const { body: allBooks } = await httpClient.getAllBooks({
      queryParams: { max: 12 },
    });
    expect(allBooks).toEqual([myBook]);

    const { body: fetchedBook } = await httpClient.getByTitle({
      urlParams: { title: "potter" },
    });
    expect(fetchedBook).toEqual(myBook);
  });
});
