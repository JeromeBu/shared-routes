var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { defineRoute, defineRoutes } from "../src/index.mjs";
import { z } from "zod";
import { createOpenApiGenerator } from "../src/openapi/index.mjs";
import { it, expect } from "vitest";
var bookSchema = z.object({ title: z.string(), author: z.string() });
var withAuthorizationSchema = z.object({ authorization: z.string() });
var routes = defineRoutes({
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
var rootInfo = {
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
                type: "apiKey",
                in: "header",
                name: "authorization",
            },
        },
    },
};
var generateOpenApi = createOpenApiGenerator({ Books: routes }, rootInfo);
var generateOpenApiJSON = function () {
    return generateOpenApi({
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
};
var bookJsonSchema = {
    additionalProperties: false,
    type: "object",
    properties: {
        title: { type: "string" },
        author: { type: "string" },
    },
    required: ["title", "author"],
};
var expected = __assign(__assign({}, rootInfo), { paths: {
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
                            schema: __assign(__assign({ title: "my Book", description: "Represents a book" }, bookJsonSchema), { additionalProperties: undefined }),
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
                                schema: __assign(__assign({}, bookJsonSchema), { additionalProperties: undefined }),
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
    } });
it("has the expected shape", function () {
    var openApiJSON = generateOpenApiJSON();
    // console.log("--- Actual SPEC ---");
    // console.log(JSON.stringify(openApiJSON, null, 2));
    expect(openApiJSON).toEqual(expected);
});
//# sourceMappingURL=createOpenApiGenerator.test.mjs.map