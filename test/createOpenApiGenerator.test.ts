import { OpenAPIV3 } from "openapi-types";
import { defineRoute, defineRoutes } from "../src";
import { z } from "zod";
import { createOpenApiGenerator } from "../src/openapi";
import { it, expect } from "vitest";

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
    responses: { 200: bookSchema },
  }),
  addBook: defineRoute({
    url: "/books",
    method: "post",
    requestBodySchema: bookSchema,
    headersSchema: withAuthorizationSchema,
  }),
});

const rootInfo = {
  info: {
    title: "My book API",
    description: "My test openApi description",
    version: "1",
  },
  servers: [{ url: "/api" }],
  openapi: "3.1.0",
};

const generateOpenApi = createOpenApiGenerator({ Books: routes }, rootInfo);

const generateOpenApiJSON = () =>
  generateOpenApi({
    Books: {
      addBook: {
        summary: "To add a book",
        description: "To add a book",
        extraDocs: {
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

const expected: OpenAPIV3.Document = {
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
        parameters: [
          {
            in: "header",
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
              },
            },
          },
          required: true,
        },
        responses: {
          "201": {
            description: "Success 201 for addBook. Returns void",
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
          "200": {
            description: "Success 200 for getByTitle",
            content: {
              "application/json": {
                schema: bookJsonSchema,
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
