import { z } from "zod";
import { defineRoutes, defineRoute, definePrefixedRoute } from "./defineRoute";

describe("defineRoutes", () => {
  it("does not allow 2 routes with same verb and path", () => {
    const createMySharedRoutes = () =>
      defineRoutes({
        addBook: defineRoute({
          verb: "post",
          path: "/books",
          bodySchema: z.object({ title: z.string() }),
        }),
        getAllBooks: defineRoute({
          verb: "post",
          path: "/books",
          outputSchema: z.array(z.object({ id: z.string(), name: z.string() })),
        }),
      });

    expect(createMySharedRoutes).toThrowError(
      new Error(
        "You cannot have several routes with same verb and path, got: POST /books twice (at least)"
      )
    );
  });
  it("create routes with the expected types", () => {
    const { routes } = defineRoutes({
      addBook: defineRoute({
        verb: "post",
        path: "/books",
        bodySchema: z.object({ title: z.string() }),
      }),
      getAllBooks: defineRoute({
        verb: "get",
        path: "/books",
        querySchema: z.object({ lala: z.string() }),
        outputSchema: z.array(z.object({ id: z.string(), name: z.string() })),
      }),
    });

    expect(() => routes.getAllBooks.bodySchema.parse({ yo: "lala" })).toThrow();
  });

  it("allows to give a route path prefix common to all defined shared routes", () => {
    const { routes, routeOptions } = definePrefixedRoute("/books", {
      addBook: defineRoute({
        verb: "post",
        path: "/",
        bodySchema: z.object({ title: z.string() }),
      }),
      getAllBooks: defineRoute({
        verb: "get",
        path: "/",
        querySchema: z.object({ lala: z.string() }),
        outputSchema: z.array(z.object({ id: z.string(), name: z.string() })),
      }),
    });
  });
});
