/* eslint-disable @typescript-eslint/no-unused-expressions */

import axios from "axios";
import { defineRoute, defineRoutes, listRoutes } from "../src";
import { z } from "zod";
import { createAxiosSharedClient } from "../src/axios";
import { createFetchSharedClient } from "../src/fetch";
import { describe, it, expect, beforeEach } from "vitest";
import { HttpClientOptions } from "../src/validations";

describe("createSharedCaller", () => {
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
        responses: { 200: z.array(bookSchema) },
      }),
      getByTitle: defineRoute({
        method: "get",
        url: "/books/:title",
        responses: { 200: bookSchema, 404: z.object({ message: z.string() }) },
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

      if (getByTitleResponse.status === 404) {
        getByTitleResponse.body; // type is { message: string }, as expected
      } else {
        getByTitleResponse.body; // type is Book, as expected
      }
    };
  });

  describe("Actually calling an endpoint", () => {
    let sideEffects: any[] = [];

    beforeEach(() => {
      sideEffects = [];
    });

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
        queryParamsSchema: z.object({
          userId: z.number(),
          max: z.number().optional(),
        }),
        responses: {
          200: todoSchema,
          400: z.object({ message: z.string() }),
        },
      }),
      addPost: defineRoute({
        method: "post",
        url: "https://jsonplaceholder.typicode.com/posts",
        requestBodySchema: z.object({
          title: z.string(),
          body: z.string(),
          userId: z.number(),
        }),
        responses: { 201: z.object({ id: z.number() }) },
      }),
      updatePostWithIncorrectReturnCode: defineRoute({
        method: "put",
        url: "https://jsonplaceholder.typicode.com/posts/:postId",
        requestBodySchema: z.object({
          title: z.string(),
          body: z.string(),
          userId: z.number(),
        }),
        responses: {
          208: z.object({ id: z.number() }),
        },
      }),
    });

    const makeOnResponseSideEffect = (): {
      calledWith: any[];
      onResponseSideEffect: HttpClientOptions["onResponseSideEffect"];
    } => {
      const calledWith: any[] = [];
      return {
        calledWith,
        onResponseSideEffect: (params) => {
          calledWith.push(params);
        },
      };
    };

    it("when the endpoint is timed out, it still runs the side effect (axios)", async () => {
      const { calledWith, onResponseSideEffect } = makeOnResponseSideEffect();
      const httpClient = createAxiosSharedClient(routes, axios.create({ timeout: 1 }), {
        onResponseSideEffect,
      });
      await expect(
        httpClient.getByTodoById({
          urlParams: { todoId: "3" },
          queryParams: { userId: 1, max: undefined },
        }),
      ).rejects.toThrow("timeout of 1ms exceeded");
      expect(calledWith).toHaveLength(1);
      expect(calledWith[0]).toMatchObject({
        durationInMs: expect.any(Number),
        input: {
          queryParams: { userId: 1 },
          urlParams: { todoId: "3" },
        },
        response: {
          status: null,
          body: "timeout of 1ms exceeded",
          headers: {},
        },
      });
    });

    it("when the endpoint is timed out, it still runs the side effect (fetch)", async () => {
      const { calledWith, onResponseSideEffect } = makeOnResponseSideEffect();
      const httpClient = createFetchSharedClient(routes, fetch, {
        timeout: 1,
        onResponseSideEffect,
      });
      await expect(
        httpClient.getByTodoById({
          urlParams: { todoId: "3" },
          queryParams: { userId: 1, max: undefined },
        }),
      ).rejects.toThrow("timeout of 1ms exceeded");
      expect(calledWith).toHaveLength(1);
      expect(calledWith[0]).toMatchObject({
        durationInMs: expect.any(Number),
        input: {
          queryParams: { userId: 1 },
          urlParams: { todoId: "3" },
        },
        response: {
          status: null,
          body: "timeout of 1ms exceeded",
          headers: {},
        },
      });
    });

    it.each([
      { name: "axios", httpClient: createAxiosSharedClient(routes, axios) },
      { name: "fetch", httpClient: createFetchSharedClient(routes, fetch) },
    ])(
      "actually calls a placeholder endpoint, using $name",
      async ({ httpClient, name }) => {
        expect(listRoutes(routes)).toEqual([
          "GET https://jsonplaceholder.typicode.com/todos/:todoId",
          "POST https://jsonplaceholder.typicode.com/posts",
          "PUT https://jsonplaceholder.typicode.com/posts/:postId",
        ]);

        const response = await httpClient.getByTodoById({
          urlParams: { todoId: "3" },
          queryParams: { userId: 1, max: undefined },
        });
        const expectedResponseBody: z.infer<typeof todoSchema> = {
          id: 3,
          userId: 1,
          completed: false,
          title: "fugiat veniam minus",
        };

        expect(response.body).toEqual(expectedResponseBody);
        expect(response.status).toBe(200);

        const addPostResponse = await httpClient.addPost({
          body: { title: "My great post", body: "Some content", userId: 1 },
        });
        expect(addPostResponse.body.id).toBeTypeOf("number");
        expect(addPostResponse.status).toBe(201);
        expect(addPostResponse.headers).toMatchObject({
          "content-type": "application/json; charset=utf-8",
        });

        await expect(
          httpClient.addPost({ body: { wrong: "body" } as any }),
        ).rejects.toThrow(
          [
            `Shared-route schema 'requestBodySchema' was not respected in adapter '${name}'.`,
            "Route: POST https://jsonplaceholder.typicode.com/posts",
            "Issues: title: Required | body: Required | userId: Required",
          ].join("\n"),
        );

        await expect(
          httpClient.updatePostWithIncorrectReturnCode({
            urlParams: { postId: "1" },
            body: { title: "My great post", body: "Some content", userId: 1 },
          }),
        ).rejects.toThrow(
          [
            `Shared-route schema 'responses' was not respected in adapter '${name}'.`,
            "Received status: 200. Handled statuses: 208.",
            "Route: PUT https://jsonplaceholder.typicode.com/posts/:postId",
          ].join("\n"),
        );
      },
      { timeout: 3_000 },
    );

    it.each([
      {
        name: "axios",
        httpClient: createAxiosSharedClient(routes, axios, {
          skipInputValidation: true,
          onResponseSideEffect: (result) => sideEffects.push(result),
        }),
      },
      {
        name: "fetch",
        httpClient: createFetchSharedClient(routes, fetch, {
          skipInputValidation: true,
          onResponseSideEffect: (result) => sideEffects.push(result),
        }),
      },
    ])(
      "can skip the validation for input params or response, and have sideEffect function on response. For $name",
      async ({ httpClient }) => {
        const wrongInputBody = { wrong: "body" } as any;
        const response = await httpClient.addPost({ body: wrongInputBody });
        expect(response.body).toBeTruthy();

        const correctInputBody = {
          title: "My great post",
          body: "Some content",
          userId: 1,
        };
        const addPostResponse = await httpClient.addPost({
          body: correctInputBody,
        });
        expect(addPostResponse.body.id).toBeTypeOf("number");
        expect(sideEffects).toHaveLength(2);
        expect(sideEffects[0]).toMatchObject({
          route: routes.addPost,
          durationInMs: expect.any(Number),
          input: {
            body: wrongInputBody,
          },
          response: {
            status: response.status,
            body: response.body,
            headers: response.headers,
          },
        });
        expect(sideEffects[1]).toMatchObject({
          route: routes.addPost,
          durationInMs: expect.any(Number),
          input: {
            body: correctInputBody,
          },
          response: {
            status: addPostResponse.status,
            body: addPostResponse.body,
            headers: addPostResponse.headers,
          },
        });
      },
    );

    const skippedStatuses = [200];

    it.each([
      {
        name: "axios",
        httpClient: createAxiosSharedClient(routes, axios, {
          skipResponseValidationForStatuses: skippedStatuses,
        }),
      },
      {
        name: "fetch",
        httpClient: createFetchSharedClient(routes, fetch, {
          skipResponseValidationForStatuses: skippedStatuses,
        }),
      },
    ])(
      "can skip the response validation for some selected statuses, for $name",
      async ({ httpClient }) => {
        const postId = "1";
        const body = { title: "My great post", body: "Some content", userId: 1 };
        const response = await httpClient.updatePostWithIncorrectReturnCode({
          urlParams: { postId: "1" },
          body,
        });
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ ...body, id: +postId });
      },
    );

    describe("explicit error when calling without respecting the contract", () => {
      const todoSchema = z.object({
        userId: z.number(),
        id: z.number(),
        title: z.string(),
        completed: z.boolean(),
      });

      const routes = defineRoutes({
        getTodos: defineRoute({
          method: "get",
          url: "https://jsonplaceholder.typicode.com/todos",
          queryParamsSchema: z.object({
            userId: z.number(),
            max: z.number().optional(),
          }),
          responses: { 200: z.array(z.number()) }, // this is not the correct schema, we want to trigger an error on return
        }),
        addTodo: defineRoute({
          method: "post",
          url: "https://jsonplaceholder.typicode.com/todos",
          requestBodySchema: todoSchema,
          headersSchema: z.object({ authorization: z.string() }),
        }),
      });

      const httpClient = createFetchSharedClient(routes, fetch);

      it("when query params are wrong", async () => {
        await expect(
          httpClient.getTodos({ queryParams: { userWrongKey: "yolo" } as any }),
        ).rejects.toThrow(
          [
            `Shared-route schema 'queryParamsSchema' was not respected in adapter 'fetch'.`,
            "Route: GET https://jsonplaceholder.typicode.com/todos",
          ].join("\n"),
        );
      });

      it("when response body is wrong", async () => {
        await expect(httpClient.getTodos({ queryParams: { userId: 1 } })).rejects.toThrow(
          [
            "Shared-route schema 'responses' was not respected in adapter 'fetch'.",
            "Received status: 200. Handled statuses: 200.",
            "Route: GET https://jsonplaceholder.typicode.com/todos",
          ].join("\n"),
        );
      });

      it("when request body is wrong", async () => {
        await expect(
          httpClient.addTodo({
            body: { wrong: "yolo" } as any,
            headers: { authorization: "some-token" },
          }),
        ).rejects.toThrow(
          [
            "Shared-route schema 'requestBodySchema' was not respected in adapter 'fetch'.",
            "Route: POST https://jsonplaceholder.typicode.com/todos",
          ].join("\n"),
        );
      });

      it("when headers are wrong", async () => {
        await expect(
          httpClient.addTodo({
            body: { id: 123, userId: 456, title: "some title", completed: false },
            headers: { auth: "some-token" } as any,
          }),
        ).rejects.toThrow(
          [
            "Shared-route schema 'headersSchema' was not respected in adapter 'fetch'.",
            "Route: POST https://jsonplaceholder.typicode.com/todos",
          ].join("\n"),
        );
      });
    });
  });
});
