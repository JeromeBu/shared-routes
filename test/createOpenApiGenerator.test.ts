import { OpenAPIV3_1 } from "openapi-types";
import { expect, it } from "vitest";
import { z } from "zod";
import { defineRoute, defineRoutes } from "../src";
import { createOpenApiGenerator } from "../src/openapi";

const bookSchema = z.object({ title: z.string(), author: z.string() });
const withAuthorizationSchema = z.object({ authorization: z.string() });

const routes = defineRoutes({
  getAllBooks: defineRoute({
    url: "/books",
    method: "get",
    queryParamsSchema: z.object({
      max: z.number().optional(),
      truc: z.string(),
    }),
    responses: { 200: z.array(bookSchema) },
  }),
  getByTitle: defineRoute({
    url: "/books/:title",
    method: "get",
    responses: { 200: bookSchema, 404: z.object({ message: z.string() }) },
  }),
  addBook: defineRoute({
    url: "/books",
    method: "post",
    requestBodySchema: bookSchema,
    headersSchema: withAuthorizationSchema,
  }),
});

const rootInfo: Parameters<typeof createOpenApiGenerator>[1] = {
  info: {
    title: "My book API",
    description: "My test openApi description",
    version: "1",
  },
  servers: [{ url: "/api" }],
  openapi: "3.1.0",
  components: {
    securitySchemes: {
      apiKeyAuth: {
        description: "The API key to access this API",
        type: "apiKey" as const,
        in: "header",
        name: "authorization",
      },
    },
  },
};

const generateOpenApi = createOpenApiGenerator({ Books: routes }, rootInfo);

const generateOpenApiJSON = () =>
  generateOpenApi({
    Books: {
      addBook: {
        summary: "To add a book",
        description: "To add a book",
        extraDocs: {
          securitySchemeToApply: ["apiKeyAuth"],
          headerParams: {
            authorization: {
              example: "my-auth-token",
            },
          },
          body: {
            title: "my Book",
            description: "Represents a book",
            examples: {
              harry: {
                summary: "Harry Potter summary (getByTitle param)",
                description: "Harry Potter description (getByTitle param)",
                value: {
                  title: "Harry Potter (addBook body)",
                  author: "JK Rowlings (addBook body)",
                },
              },
              miserables: {
                summary: "Miserables summary (getByTitle param)",
                description: "Miserables description (getByTitle param)",
                value: {
                  title: "Les miserables (addBook body)",
                  author: "Victor Hugo (addBook body)",
                },
              },
            },
          },
          responses: {
            201: {
              description: "Success 201 for addBook. Returns void",
            },
          },
        },
      },
      getByTitle: {
        extraDocs: {
          urlParams: {
            title: {
              description: "The title of the book",
              examples: {
                harry: {
                  summary: "Harry Potter summary (getByTitle param)",
                  description: "Harry Potter description (getByTitle param)",
                  value: "harry-potter",
                },
              },
            },
          },

          responses: {
            "200": {
              description: "Success 200 for getByTitle",
              examples: {
                harry: {
                  summary: "Harry Potter summary (getByTitle 200)",
                  description: "Harry Potter description (getByTitle 200)",
                  value: {
                    title: "Harry Potter (getByTitle 200)",
                    author: "JK Rowlings (getByTitle 200)",
                  },
                },
                lordOfRing: {
                  summary: "Lord of the ring summary (getByTitle 200)",
                  description: "Lord of the ring description (getByTitle 200)",
                  value: {
                    title: "Lord of the ring (getByTitle 200)",
                    author: "Tolkien (getByTitle 200)",
                  },
                },
              },
            },
            404: {
              description: "Not found 404 for getByTitle",
            },
          },
        },
      },
      getAllBooks: {
        summary: "To get all books",
        description: "To get all books",
        extraDocs: {
          queryParams: {
            max: {
              description: "Le maximum à retourner",
              example: 15,
              allowEmptyValue: true,
            },
            truc: { deprecated: true, example: "machin..." },
          },
          responses: {
            200: {
              description: "Success 200 for getAllBooks",
            },
          },
        },
      },
    },
  });

const bookJsonSchema = {
  additionalProperties: false,
  type: "object" as const,
  properties: {
    title: { type: "string" as const },
    author: { type: "string" as const },
  },
  required: ["title", "author"],
};

const expected: OpenAPIV3_1.Document = {
  ...rootInfo,
  paths: {
    "/books": {
      get: {
        summary: "To get all books",
        description: "To get all books",
        tags: ["Books"],
        parameters: [
          {
            allowEmptyValue: true,
            description: "Le maximum à retourner",
            example: 15,
            name: "max",
            required: false,
            schema: { type: "number" },
            in: "query",
          },
          {
            example: "machin...",
            deprecated: true,
            in: "query",
            name: "truc",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Success 200 for getAllBooks",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: bookJsonSchema,
                },
              },
            },
          },
        },
      },
      post: {
        summary: "To add a book",
        description: "To add a book",
        tags: ["Books"],
        security: [{ apiKeyAuth: [] }],
        parameters: [
          {
            in: "header",
            example: "my-auth-token",
            name: "authorization",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        requestBody: {
          content: {
            "application/json": {
              examples: {
                harry: {
                  summary: "Harry Potter summary (getByTitle param)",
                  description: "Harry Potter description (getByTitle param)",
                  value: {
                    title: "Harry Potter (addBook body)",
                    author: "JK Rowlings (addBook body)",
                  },
                },
                miserables: {
                  summary: "Miserables summary (getByTitle param)",
                  description: "Miserables description (getByTitle param)",
                  value: {
                    title: "Les miserables (addBook body)",
                    author: "Victor Hugo (addBook body)",
                  },
                },
              },
              schema: {
                title: "my Book",
                description: "Represents a book",
                ...bookJsonSchema,
                additionalProperties: undefined,
              },
            },
          },
          required: true,
        },
        responses: {
          "201": {
            description: "Success 201 for addBook. Returns void",
            content: {
              "application/json": {
                schema: {
                  anyOf: [
                    {
                      maxLength: 0,
                      type: "string",
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/books/{title}": {
      get: {
        tags: ["Books"],
        parameters: [
          {
            description: "The title of the book",
            examples: {
              harry: {
                summary: "Harry Potter summary (getByTitle param)",
                description: "Harry Potter description (getByTitle param)",
                value: "harry-potter",
              },
            },
            name: "title",
            required: true,
            schema: { type: "string" },
            in: "path",
          },
        ],
        responses: {
          "404": {
            "content": {
              "application/json": {
                "schema": {
                  "properties": {
                    "message": { type: "string" },
                  },
                  "required": ["message"],
                  "type": "object",
                },
              },
            },
            "description": "Not found 404 for getByTitle",
          },
          "200": {
            description: "Success 200 for getByTitle",
            content: {
              "application/json": {
                schema: { ...bookJsonSchema, additionalProperties: undefined },
                examples: {
                  harry: {
                    summary: "Harry Potter summary (getByTitle 200)",
                    description: "Harry Potter description (getByTitle 200)",
                    value: {
                      title: "Harry Potter (getByTitle 200)",
                      author: "JK Rowlings (getByTitle 200)",
                    },
                  },
                  lordOfRing: {
                    summary: "Lord of the ring summary (getByTitle 200)",
                    description: "Lord of the ring description (getByTitle 200)",
                    value: {
                      title: "Lord of the ring (getByTitle 200)",
                      author: "Tolkien (getByTitle 200)",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

it("has the expected shape", () => {
  const openApiJSON = generateOpenApiJSON();
  // console.log("--- Actual SPEC ---");
  // console.log(JSON.stringify(openApiJSON, null, 2));

  expect(openApiJSON).toEqual(expected);
});

it("extracts query params from intersection schemas", () => {
  const routesWithComplexQuery = defineRoutes({
    getItems: defineRoute({
      url: "/items",
      method: "get",
      queryParamsSchema: z
        .object({ a: z.string() })
        .and(
          z.discriminatedUnion("sortBy", [
            z.object({ sortBy: z.literal("name"), order: z.enum(["asc", "desc"]) }),
            z.object({ sortBy: z.literal("date"), order: z.enum(["asc", "desc"]) }),
          ]),
        )
        .and(z.object({ b: z.string(), limit: z.number().optional() })),
      responses: { 200: z.array(z.object({ id: z.string() })) },
    }),
  });

  const generateComplexQueryOpenApi = createOpenApiGenerator(
    { Items: routesWithComplexQuery },
    rootInfo,
  );

  const openApiDoc = generateComplexQueryOpenApi({
    Items: {
      getItems: {
        extraDocs: {
          responses: {
            200: {
              description: "Success",
            },
          },
        },
      },
    },
  });

  const parameters = openApiDoc.paths!["/items"]!.get!.parameters as any[];
  expect(parameters).toBeDefined();

  const paramNames = parameters.map((p) => p.name);
  expect(paramNames).toContain("a");
  expect(paramNames).toContain("b");
  expect(paramNames).toContain("limit");

  const limitParam = parameters.find((p) => p.name === "limit");
  expect(limitParam?.required).toBe(false);

  const aParam = parameters.find((p) => p.name === "a");
  expect(aParam?.required).toBe(true);
});

it("generates proper OpenAPI structure for union and intersection in requestBody", () => {
  const schemaA = z.object({ type: z.literal("A"), valueA: z.string() });
  const schemaB = z.object({ type: z.literal("B"), valueB: z.number() });
  const commonFields = z.object({ id: z.string(), timestamp: z.number() });

  const routesWithComplexBody = defineRoutes({
    createItem: defineRoute({
      url: "/items",
      method: "post",
      requestBodySchema: schemaA.or(schemaB).and(commonFields),
      responses: { 201: z.object({ success: z.boolean() }) },
    }),
  });

  const generateComplexBodyOpenApi = createOpenApiGenerator(
    { Items: routesWithComplexBody },
    rootInfo,
  );

  const openApiDoc = generateComplexBodyOpenApi({
    Items: {
      createItem: {
        extraDocs: {
          responses: {
            201: {
              description: "Success",
            },
          },
        },
      },
    },
  });

  const requestBody = openApiDoc.paths!["/items"]!.post!.requestBody!;
  expect(requestBody).toBeDefined();

  const schema = (requestBody as any).content!["application/json"].schema;
  expect(schema).toBeDefined();

  expect(schema.allOf).toBeDefined();
  expect(schema.allOf).toHaveLength(2);

  const unionPart = schema.allOf[0];
  expect(unionPart.anyOf).toBeDefined();
  expect(unionPart.anyOf).toHaveLength(2);

  expect(unionPart.anyOf[0].properties?.type?.const).toBe("A");
  expect(unionPart.anyOf[0].properties?.valueA).toBeDefined();

  expect(unionPart.anyOf[1].properties?.type?.const).toBe("B");
  expect(unionPart.anyOf[1].properties?.valueB).toBeDefined();

  const intersectionPart = schema.allOf[1];
  expect(intersectionPart.properties?.id).toBeDefined();
  expect(intersectionPart.properties?.timestamp).toBeDefined();
});
