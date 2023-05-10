import axios from "axios";
import { defineRoute, defineRoutes, listRoutes } from "../src";
import { z } from "zod";
import { createAxiosSharedClient } from "../src/axios/createAxiosSharedClient";
import { describe, it, expect } from "vitest";

describe("createAxiosSharedCaller", () => {
  it("create a caller from axios and sharedRoutes object", async () => {
    const bookSchema = z.object({ title: z.string(), author: z.string() });
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
        queryParamsSchema: z.object({ max: z.number() }),
        responseBodySchema: z.array(bookSchema),
      }),
      getByTitle: defineRoute({
        method: "get",
        url: "/books/:title",
      }),
    });

    const axiosSharedCaller = createAxiosSharedClient(routes, axios);

    expect(listRoutes(routes)).toEqual([
      "POST /books",
      "GET /books",
      "GET /books/:title",
    ]);

    // the code below will not past test as no server is receiving the calls,
    // but it is usefull to check that types are working fine.
    const _notExecuted = async () => {
      const addBookResponse = await axiosSharedCaller.addBook({
        body: { title: "lala", author: "bob" },
        headers: { authorization: "some-token" },
      });
      addBookResponse.body; // type is void, as expected

      const getAllBooksResponse = await axiosSharedCaller.getAllBooks({
        queryParams: { max: 3 },
      });
      getAllBooksResponse.body; // type is Book[], as expected

      const getByTitleResponse = await axiosSharedCaller.getByTitle({
        urlParams: { title: "great" },
      });
      getByTitleResponse.body; // type is Book[], as expected
    };
  });

  it("actually calls a placeholder endpoint", async () => {
    // WARNING : This test uses an actual placeholder api (which might not always be available...)
    const todoSchema = z.object({
      userId: z.number(),
      id: z.number(),
      title: z.string(),
      completed: z.boolean(),
    });

    const routes = defineRoutes({
      getByTodoById: defineRoute({
        method: "get",
        url: "https://jsonplaceholder.typicode.com/todos/:todoId",
        responseBodySchema: todoSchema,
      }),
    });

    expect(listRoutes(routes)).toEqual([
      "GET https://jsonplaceholder.typicode.com/todos/:todoid",
    ]);

    const axiosCaller = createAxiosSharedClient(routes, axios);
    const response = await axiosCaller.getByTodoById({
      urlParams: { todoId: "3" },
    });
    const expectedResponseBody: z.infer<typeof todoSchema> = {
      id: 3,
      userId: 1,
      completed: false,
      title: "fugiat veniam minus",
    };
    expect(response.body).toEqual(expectedResponseBody);
    expect(response.status).toBe(200);
  });
});
