import { z } from "zod";
import { describe, it, expect } from "vitest";
import { defineRoutes, defineRoute, listRoutes } from "../src/index.mjs";
describe("Shared routes definitions", function () {
    describe("defineRoutes", function () {
        it("does not allow 2 routes with same method and url", function () {
            var createMySharedRoutes = function () {
                return defineRoutes({
                    addBook: defineRoute({
                        method: "post",
                        url: "/books",
                        requestBodySchema: z.object({ title: z.string() }),
                    }),
                    getAllBooks: defineRoute({
                        method: "post",
                        url: "/books",
                        responses: { 200: z.array(z.object({ id: z.string(), name: z.string() })) },
                    }),
                });
            };
            expect(createMySharedRoutes).toThrowError(new Error("You cannot have several routes with same http method and url, got: POST /books twice (at least)"));
        });
        it("create routes with the expected types and shows list of routes", function () {
            var routes = defineRoutes({
                addBook: defineRoute({
                    method: "post",
                    url: "/books",
                    requestBodySchema: z.object({ title: z.string() }),
                }),
                getAllBooks: defineRoute({
                    method: "get",
                    url: "/books",
                    queryParamsSchema: z.object({ lala: z.string() }),
                    responses: { 200: z.array(z.object({ id: z.string(), name: z.string() })) },
                }),
            });
            expect(function () { return routes.getAllBooks.requestBodySchema.parse({ yo: "lala" }); }).toThrow();
            expect(listRoutes(routes)).toEqual(["POST /books", "GET /books"]);
        });
    });
});
//# sourceMappingURL=defineRoutes.test.mjs.map