import { z } from "zod";
import { describe, it, expect } from "vitest";
import { defineRoute, defineRoutes, createCustomSharedClient } from "../src/core";

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
    bodySchema: bookSchema,
    headersSchema: withAuthorizationSchema,
  }),
  getAllBooks: defineRoute({
    method: "get",
    url: "/books",
    queryParamsSchema: z.object({ max: z.number() }),
    responseBodySchema: z.array(bookSchema),
  }),
  getByTitle: defineRoute({
    method: "get",
    url: "/books/:title",
    responseBodySchema: bookSchema.optional(),
  }),
});

// const books: Book[] = [];

const createTestHttpClient = () => {
  const books: Book[] = [];

  return createCustomSharedClient(myRoutes, {
    addBook: async ({ body }) => {
      console.log("adding a book : ", body);
      books.push(body);
      return { status: 200, body: undefined };
    },
    getAllBooks: async () => {
      console.log("getAllBooks was called : ", books);

      return {
        status: 200,
        body: books,
      };
    },
    getByTitle: async ({ urlParams: { title } }) => ({
      status: 200,
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
    expect(response.status).toBe(200);
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
