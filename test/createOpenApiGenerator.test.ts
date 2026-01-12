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

  const openApiDoc = createOpenApiGenerator(
    { Items: routesWithComplexQuery },
    rootInfo,
  )({
    Items: {
      getItems: {
        extraDocs: { responses: { 200: { description: "Success" } } },
      },
    },
  });

  const parameters = openApiDoc.paths!["/items"]!.get!.parameters as any[];
  const paramNames = parameters.map((p) => p.name);

  expect(paramNames).toContain("a");
  expect(paramNames).toContain("b");
  expect(paramNames).toContain("limit");
  expect(parameters.find((p) => p.name === "limit")?.required).toBe(false);
  expect(parameters.find((p) => p.name === "a")?.required).toBe(true);
});

it("generates proper OpenAPI structure for union and intersection in requestBody", () => {
  const schemaA = z.object({ type: z.literal("A"), valueA: z.string() });
  const schemaB = z.object({ type: z.literal("B"), valueB: z.number() });
  const commonFields = z.object({ id: z.string(), timestamp: z.number() });

  const openApiDoc = createOpenApiGenerator(
    {
      Items: defineRoutes({
        createItem: defineRoute({
          url: "/items",
          method: "post",
          requestBodySchema: schemaA.or(schemaB).and(commonFields),
          responses: { 201: z.object({ success: z.boolean() }) },
        }),
      }),
    },
    rootInfo,
  )({
    Items: {
      createItem: { extraDocs: { responses: { 201: { description: "Success" } } } },
    },
  });

  const schema = (openApiDoc.paths!["/items"]!.post!.requestBody as any).content![
    "application/json"
  ].schema;

  expect(schema.allOf).toHaveLength(2);
  expect(schema.allOf[0].anyOf).toHaveLength(2);
  expect(schema.allOf[0].anyOf[0].properties?.type?.const).toBe("A");
  expect(schema.allOf[0].anyOf[0].properties?.valueA).toBeDefined();
  expect(schema.allOf[0].anyOf[1].properties?.type?.const).toBe("B");
  expect(schema.allOf[0].anyOf[1].properties?.valueB).toBeDefined();
  expect(schema.allOf[1].properties?.id).toBeDefined();
  expect(schema.allOf[1].properties?.timestamp).toBeDefined();
});

it("extracts header parameters from z.looseObject", () => {
  const openApiDoc = createOpenApiGenerator(
    {
      Items: defineRoutes({
        createItem: defineRoute({
          url: "/items",
          method: "post",
          headersSchema: z.looseObject({
            authorization: z.string(),
            "x-api-key": z.string().optional(),
          }),
          requestBodySchema: z.object({ name: z.string() }),
          responses: { 201: z.object({ id: z.string() }) },
        }),
      }),
    },
    rootInfo,
  )({
    Items: {
      createItem: {
        extraDocs: {
          headerParams: { authorization: { description: "Bearer token" } },
          responses: { 201: { description: "Success" } },
        },
      },
    },
  });

  const parameters = openApiDoc.paths!["/items"]!.post!.parameters as any[];
  const authParam = parameters.find((p) => p.name === "authorization");
  const apiKeyParam = parameters.find((p) => p.name === "x-api-key");

  expect(authParam?.in).toBe("header");
  expect(authParam?.required).toBe(true);
  expect(authParam?.description).toBe("Bearer token");
  expect(authParam?.schema.type).toBe("string");
  expect(apiKeyParam?.in).toBe("header");
  expect(apiKeyParam?.required).toBe(false);
});

it("generates requestBody for discriminated union schemas", () => {
  const openApiDoc = createOpenApiGenerator(
    {
      Contact: defineRoutes({
        contact: defineRoute({
          url: "/contact",
          method: "post",
          requestBodySchema: z.discriminatedUnion("contactMode", [
            z.object({ contactMode: z.literal("email"), email: z.string() }),
            z.object({ contactMode: z.literal("phone"), phone: z.string() }),
          ]),
          responses: { 200: z.object({ success: z.boolean() }) },
        }),
      }),
    },
    rootInfo,
  )({
    Contact: {
      contact: {
        extraDocs: {
          body: {
            examples: {
              email: {
                value: { contactMode: "email" as const, email: "test@example.com" },
              },
              phone: { value: { contactMode: "phone" as const, phone: "+33123456789" } },
            },
          },
          responses: { 200: { description: "Success" } },
        },
      },
    },
  });

  const content = (openApiDoc.paths!["/contact"]!.post!.requestBody as any).content![
    "application/json"
  ];

  expect(content.schema).toBeDefined();
  expect(content.examples.email).toBeDefined();
  expect(content.examples.phone).toBeDefined();
});

it("generates requestBody with allOf for union.and(object) pattern", () => {
  const schemaA = z.object({ type: z.literal("A"), valueA: z.string() });
  const schemaB = z.object({ type: z.literal("B"), valueB: z.number() });
  const commonFields = z.object({
    siret: z.string().optional(),
    note: z.string().optional(),
  });

  const openApiDoc = createOpenApiGenerator(
    {
      Contact: defineRoutes({
        contactEstablishment: defineRoute({
          url: "/v3/contact-establishment",
          method: "post",
          requestBodySchema: schemaA.or(schemaB).and(commonFields),
          headersSchema: z.looseObject({ authorization: z.string() }),
          responses: { 200: z.object({ success: z.boolean() }) },
        }),
      }),
    },
    rootInfo,
  )({
    Contact: {
      contactEstablishment: {
        extraDocs: {
          body: {
            examples: {
              exampleA: {
                value: { type: "A" as const, valueA: "test", siret: "12345678901234" },
              },
              exampleB: {
                value: { type: "B" as const, valueB: 42, note: "some note" },
              },
            },
          },
          responses: { 200: { description: "Success" } },
        },
      },
    },
  });

  const content = (
    openApiDoc.paths!["/v3/contact-establishment"]!.post!.requestBody as any
  ).content!["application/json"];
  const schema = content.schema;

  expect(schema.allOf).toHaveLength(2);
  expect(schema.allOf[0].anyOf).toHaveLength(2);
  expect(schema.allOf[0].anyOf[0].properties?.type?.const).toBe("A");
  expect(schema.allOf[0].anyOf[0].properties?.valueA).toBeDefined();
  expect(schema.allOf[0].anyOf[1].properties?.type?.const).toBe("B");
  expect(schema.allOf[0].anyOf[1].properties?.valueB).toBeDefined();
  expect(schema.allOf[1].properties?.siret).toBeDefined();
  expect(schema.allOf[1].properties?.note).toBeDefined();
  expect(content.examples.exampleA).toBeDefined();
  expect(content.examples.exampleB).toBeDefined();
});

it("extracts query params from top-level union schema", () => {
  const routesWithTopLevelUnion = defineRoutes({
    search: defineRoute({
      method: "get",
      url: "/search-union",
      queryParamsSchema: z.union([
        z.object({ sortBy: z.literal("date"), order: z.enum(["asc", "desc"]) }),
        z.object({ sortBy: z.literal("distance"), lat: z.number(), lng: z.number() }),
      ]),
      responses: { 200: z.array(z.string()) },
    }),
  });

  const openApiDoc = createOpenApiGenerator(
    { Search: routesWithTopLevelUnion },
    rootInfo,
  )({
    Search: {
      search: { extraDocs: { responses: { 200: { description: "Success" } } } },
    },
  });

  const params = openApiDoc.paths!["/search-union"]!.get!.parameters as any[];
  expect(params).toBeDefined();
  expect(params.length).toBeGreaterThan(0);

  const paramNames = params.map((p) => p.name);
  expect(paramNames).toContain("sortBy");
  expect(paramNames).toContain("order");
  expect(paramNames).toContain("lat");
  expect(paramNames).toContain("lng");
});

it("extracts query params from discriminated union inside intersection", () => {
  const geoParamsSchema = z.discriminatedUnion("sortBy", [
    z.object({
      sortBy: z.enum(["date", "score"]),
      sortOrder: z.enum(["asc", "desc"]).optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      distanceKm: z.number().optional(),
    }),
    z.object({
      sortBy: z.literal("distance"),
      sortOrder: z.enum(["asc", "desc"]).optional(),
      latitude: z.number(),
      longitude: z.number(),
      distanceKm: z.number(),
    }),
  ]);

  const routesWithDiscriminatedUnion = defineRoutes({
    getOffers: defineRoute({
      method: "get",
      url: "/offers",
      queryParamsSchema: z
        .object({
          appellationCodes: z.array(z.string()).optional(),
          sirets: z.array(z.string()).optional(),
        })
        .and(z.object({ page: z.number().optional(), perPage: z.number().optional() }))
        .and(geoParamsSchema)
        .and(z.object({ acquisitionCampaign: z.string().optional() })),
      responses: { 200: z.array(z.object({ id: z.string() })) },
    }),
  });

  const openApiDoc = createOpenApiGenerator(
    { Offers: routesWithDiscriminatedUnion },
    rootInfo,
  )({
    Offers: {
      getOffers: { extraDocs: { responses: { 200: { description: "Success" } } } },
    },
  });

  const params = openApiDoc.paths!["/offers"]!.get!.parameters as any[];
  const paramNames = params.map((p) => p.name);

  expect(paramNames).toContain("appellationCodes");
  expect(paramNames).toContain("sirets");
  expect(paramNames).toContain("page");
  expect(paramNames).toContain("perPage");
  expect(paramNames).toContain("sortBy");
  expect(paramNames).toContain("sortOrder");
  expect(paramNames).toContain("latitude");
  expect(paramNames).toContain("longitude");
  expect(paramNames).toContain("distanceKm");
  expect(paramNames).toContain("acquisitionCampaign");

  expect(params.find((p) => p.name === "sortBy")?.required).toBe(true);
  expect(params.find((p) => p.name === "sortOrder")?.required).toBe(false);
  expect(params.find((p) => p.name === "latitude")?.required).toBe(false);
});

it("extracts query params from regular union inside intersection", () => {
  const sortParamsSchema = z.union([
    z.object({
      sortBy: z.literal("date"),
      order: z.enum(["asc", "desc"]).optional(),
    }),
    z.object({
      sortBy: z.literal("distance"),
      latitude: z.number(),
      longitude: z.number(),
    }),
  ]);

  const routesWithUnion = defineRoutes({
    search: defineRoute({
      method: "get",
      url: "/search",
      queryParamsSchema: z
        .object({ filter: z.string().optional() })
        .and(sortParamsSchema),
      responses: { 200: z.array(z.string()) },
    }),
  });

  const openApiDoc = createOpenApiGenerator(
    { Search: routesWithUnion },
    rootInfo,
  )({
    Search: {
      search: { extraDocs: { responses: { 200: { description: "Success" } } } },
    },
  });

  const params = openApiDoc.paths!["/search"]!.get!.parameters as any[];
  const paramNames = params.map((p) => p.name);

  expect(paramNames).toContain("filter");
  expect(paramNames).toContain("sortBy");
  expect(paramNames).toContain("order");
  expect(paramNames).toContain("latitude");
  expect(paramNames).toContain("longitude");

  expect(params.find((p) => p.name === "sortBy")?.required).toBe(true);
  expect(params.find((p) => p.name === "order")?.required).toBe(false);
  expect(params.find((p) => p.name === "latitude")?.required).toBe(false);
});

it("extracts query params from deeply nested intersection with union", () => {
  const routesWithDeepNesting = defineRoutes({
    complex: defineRoute({
      method: "get",
      url: "/complex",
      queryParamsSchema: z
        .object({ a: z.string() })
        .and(z.object({ b: z.string().optional() }))
        .and(
          z.discriminatedUnion("type", [
            z.object({ type: z.literal("x"), xParam: z.number() }),
            z.object({ type: z.literal("y"), yParam: z.string() }),
          ]),
        )
        .and(z.object({ c: z.boolean().optional() })),
      responses: { 200: z.void() },
    }),
  });

  const openApiDoc = createOpenApiGenerator(
    { Complex: routesWithDeepNesting },
    rootInfo,
  )({
    Complex: {
      complex: { extraDocs: { responses: { 200: { description: "Success" } } } },
    },
  });

  const params = openApiDoc.paths!["/complex"]!.get!.parameters as any[];
  const paramNames = params.map((p) => p.name);

  expect(paramNames).toContain("a");
  expect(paramNames).toContain("b");
  expect(paramNames).toContain("c");
  expect(paramNames).toContain("type");
  expect(paramNames).toContain("xParam");
  expect(paramNames).toContain("yParam");

  expect(params.find((p) => p.name === "a")?.required).toBe(true);
  expect(params.find((p) => p.name === "b")?.required).toBe(false);
  expect(params.find((p) => p.name === "type")?.required).toBe(true);
  expect(params.find((p) => p.name === "xParam")?.required).toBe(false);
  expect(params.find((p) => p.name === "yParam")?.required).toBe(false);
});

it("generates detailed properties in union.and schemas (not just type object)", () => {
  const openApiDoc = createOpenApiGenerator(
    {
      Contact: defineRoutes({
        contact: defineRoute({
          url: "/v3/contact",
          method: "post",
          requestBodySchema: z
            .object({
              contactMode: z.literal("email"),
              email: z.string(),
              message: z.string(),
            })
            .or(
              z.object({
                contactMode: z.literal("phone"),
                phone: z.string(),
                message: z.string(),
              }),
            )
            .and(z.object({ siret: z.string().optional(), note: z.string().optional() })),
          responses: { 200: z.object({ success: z.boolean() }) },
        }),
      }),
    },
    rootInfo,
  )({
    Contact: {
      contact: { extraDocs: { responses: { 200: { description: "Success" } } } },
    },
  });

  const schema = (openApiDoc.paths!["/v3/contact"]!.post!.requestBody as any).content![
    "application/json"
  ].schema;

  expect(schema.allOf).toHaveLength(2);
  const unionPart = schema.allOf[0];
  expect(unionPart.anyOf).toHaveLength(2);
  expect(unionPart.anyOf[0].type).toBe("object");
  expect(unionPart.anyOf[0].properties.contactMode.const).toBe("email");
  expect(unionPart.anyOf[0].properties.email).toBeDefined();
  expect(unionPart.anyOf[1].properties.contactMode.const).toBe("phone");
  expect(unionPart.anyOf[1].properties.phone).toBeDefined();
  expect(schema.allOf[1].properties.siret).toBeDefined();
});

it("generates response schema for schemas with explicit transform", () => {
  const routes = defineRoutes({
    getUser: defineRoute({
      url: "/user",
      method: "get",
      responses: {
        200: z.object({
          id: z.string(),
          createdAt: z.string().transform((s) => new Date(s)),
        }),
      },
    }),
  });

  const openApiDoc = createOpenApiGenerator(
    { Users: routes },
    rootInfo,
  )({
    Users: {
      getUser: { extraDocs: { responses: { 200: { description: "Success" } } } },
    },
  });

  const schema = (openApiDoc.paths!["/user"]!.get!.responses as any)["200"].content[
    "application/json"
  ].schema;

  expect(schema.properties).toBeDefined();
  expect(schema.properties.id.type).toBe("string");
  expect(schema.properties.createdAt.type).toBe("string");
});
