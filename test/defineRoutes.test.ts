import { z } from "zod";
import { describe, it, expect } from "vitest";
import { defineRoutes, defineRoute, listRoutes } from "../src";

describe("Shared routes definitions", () => {
  describe("defineRoutes", () => {
    it("does not allow 2 routes with same method and url", () => {
      const createMySharedRoutes = () =>
        defineRoutes({
          addBook: defineRoute({
            method: "post",
            url: "/books",
            requestBodySchema: z.object({ title: z.string() }),
          }),
          getAllBooks: defineRoute({
            method: "post",
            url: "/books",
            responseBodySchema: z.array(z.object({ id: z.string(), name: z.string() })),
          }),
        });

      expect(createMySharedRoutes).toThrowError(
        new Error(
          "You cannot have several routes with same http method and url, got: POST /books twice (at least)",
        ),
      );
    });

    it("create routes with the expected types and shows list of routes", () => {
      const routes = defineRoutes({
        addBook: defineRoute({
          method: "post",
          url: "/books",
          requestBodySchema: z.object({ title: z.string() }),
        }),
        getAllBooks: defineRoute({
          method: "get",
          url: "/books",
          queryParamsSchema: z.object({ lala: z.string() }),
          responseBodySchema: z.array(z.object({ id: z.string(), name: z.string() })),
        }),
      });

      expect(() => routes.getAllBooks.requestBodySchema.parse({ yo: "lala" })).toThrow();
      expect(listRoutes(routes)).toEqual(["POST /books", "GET /books"]);
    });
  });
});
