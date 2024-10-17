"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var zod_1 = require("zod");
var vitest_1 = require("vitest");
var src_1 = require("../src");
(0, vitest_1.describe)("Shared routes definitions", function () {
    (0, vitest_1.describe)("defineRoutes", function () {
        (0, vitest_1.it)("does not allow 2 routes with same method and url", function () {
            var createMySharedRoutes = function () {
                return (0, src_1.defineRoutes)({
                    addBook: (0, src_1.defineRoute)({
                        method: "post",
                        url: "/books",
                        requestBodySchema: zod_1.z.object({ title: zod_1.z.string() }),
                    }),
                    getAllBooks: (0, src_1.defineRoute)({
                        method: "post",
                        url: "/books",
                        responses: { 200: zod_1.z.array(zod_1.z.object({ id: zod_1.z.string(), name: zod_1.z.string() })) },
                    }),
                });
            };
            (0, vitest_1.expect)(createMySharedRoutes).toThrowError(new Error("You cannot have several routes with same http method and url, got: POST /books twice (at least)"));
        });
        (0, vitest_1.it)("create routes with the expected types and shows list of routes", function () {
            var routes = (0, src_1.defineRoutes)({
                addBook: (0, src_1.defineRoute)({
                    method: "post",
                    url: "/books",
                    requestBodySchema: zod_1.z.object({ title: zod_1.z.string() }),
                }),
                getAllBooks: (0, src_1.defineRoute)({
                    method: "get",
                    url: "/books",
                    queryParamsSchema: zod_1.z.object({ lala: zod_1.z.string() }),
                    responses: { 200: zod_1.z.array(zod_1.z.object({ id: zod_1.z.string(), name: zod_1.z.string() })) },
                }),
            });
            (0, vitest_1.expect)(function () { return routes.getAllBooks.requestBodySchema.parse({ yo: "lala" }); }).toThrow();
            (0, vitest_1.expect)((0, src_1.listRoutes)(routes)).toEqual(["POST /books", "GET /books"]);
        });
    });
});
//# sourceMappingURL=defineRoutes.test.js.map