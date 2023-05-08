import { OpenAPIV3 as OpenAPI } from "npm:openapi-types@12.1.0";
import { keys, UnknownSharedRoute } from "../core/index.ts";
import { z } from "npm:zod@3.21.4";
import type { ZodFirstPartyTypeKind, ZodRawShape } from "npm:zod@3.21.4";
import zodToJsonSchema from "npm:zod-to-json-schema@3.21.0";

type TypedTag<T extends string> = {
  name: T;
};

type CreateOpenApiGenerator = <
  SharedRoutes extends Record<string, UnknownSharedRoute>,
  TagName extends string,
>(
  sharedRoutes: SharedRoutes,
  openApiRootDoc: Omit<OpenAPI.Document, "paths"> & {
    tags?: TypedTag<TagName>[];
  },
) => (
  extraDataByRoute: Partial<
    {
      [R in keyof SharedRoutes]: Omit<OpenAPI.PathItemObject, OpenAPI.HttpMethods> & {
        tags?: TagName[];
        extraDocumentation?: {
          body?: OpenAPI.BaseSchemaObject & {
            properties?: Partial<
              Record<
                keyof z.infer<SharedRoutes[R]["bodySchema"]>,
                OpenAPI.BaseSchemaObject
              >
            >;
          };
          queryParams?: Partial<
            Record<
              keyof z.infer<SharedRoutes[R]["queryParamsSchema"]>,
              Partial<OpenAPI.ParameterObject>
            >
          >;
          headerParams?: Partial<
            Record<
              keyof z.infer<SharedRoutes[R]["headersSchema"]>,
              Partial<OpenAPI.ParameterObject>
            >
          >;

          responseBody?: OpenAPI.BaseSchemaObject & {
            properties?: Partial<
              Record<
                keyof z.infer<SharedRoutes[R]["queryParamsSchema"]>,
                OpenAPI.BaseSchemaObject
              >
            >;
          };
        };
      };
    }
  >,
) => OpenAPI.Document;

export const createOpenApiGenerator: CreateOpenApiGenerator =
  (sharedRoutes, openApiRootDoc) => (extraDataByRoute) => ({
    ...openApiRootDoc,
    paths: keys(sharedRoutes).reduce((acc, routeName) => {
      const route = sharedRoutes[routeName];
      const { extraDocumentation, ...extraDataForRoute } =
        extraDataByRoute[routeName] ?? {};
      const responseSchema = zodToOpenApi(route.responseBodySchema);
      const responseSchemaType:
        | OpenAPI.NonArraySchemaObjectType
        | OpenAPI.ArraySchemaObjectType
        | undefined = (responseSchema as any).type;

      const { formattedUrl, pathParams } = extractFromUrl(route.url);

      const parameters = [
        ...(pathParams.length > 0 ? pathParams : []),
        ...(!isShapeObjectEmpty(route.queryParamsSchema)
          ? zodObjectToParameters(
              route.queryParamsSchema,
              "query",
              extraDocumentation?.queryParams,
            )
          : []),
        ...(!isShapeObjectEmpty(route.headersSchema)
          ? zodObjectToParameters(
              route.headersSchema,
              "header",
              extraDocumentation?.headerParams,
            )
          : []),
      ];

      return {
        ...acc,
        [formattedUrl]: {
          ...acc[formattedUrl],
          [route.method]: {
            ...extraDataForRoute,
            ...(parameters.length > 0 && {
              parameters,
            }),

            ...(!isShapeObjectEmpty(route.bodySchema) && {
              requestBody: {
                required: true,
                content: {
                  "application/json": {
                    schema: {
                      ...extraDocumentation?.body,
                      ...zodToOpenApi(route.bodySchema),
                    },
                  },
                },
              },
            }),

            responses: {
              "200": {
                description:
                  responseSchemaType !== undefined
                    ? "Success"
                    : "Success, with void response",
                ...(responseSchemaType !== undefined && {
                  content: {
                    "application/json": {
                      schema: responseSchema,
                    },
                  },
                }),
              },
            },
          },
        },
      };
    }, {} as any),
  });

type ParamKind = "path" | "query" | "header";

type Param = {
  name: string;
  required: boolean;
  schema: { type: string };
  in: ParamKind;
};

const extractFromUrl = (url: string): { pathParams: Param[]; formattedUrl: string } => {
  const pathParams: Param[] = [];

  const formattedUrl = url.replace(/:(.*?)(\/|$)/g, (_match, group1, group2) => {
    pathParams.push({
      name: group1,
      required: true,
      schema: { type: "string" },
      in: "path",
    });
    return `{${group1}}` + group2 ?? "";
  });

  return {
    formattedUrl,
    pathParams,
  };
};

const zodToOpenApi = (schema: Parameters<typeof zodToJsonSchema>[0]) => {
  const { $schema, ...rest } = zodToJsonSchema(schema);
  return rest;
};

const isShapeObjectEmpty = <T>(schema: z.Schema<T>): boolean => {
  const typeName = getTypeName(schema);
  if (typeName === "ZodObject") {
    const shape = getShape(schema);
    return Object.keys(shape).length === 0;
  }

  return typeName === undefined;
};

const zodObjectToParameters = <T>(
  schema: z.Schema<T>,
  paramKind: ParamKind,
  extraDocumentation: Partial<Record<keyof T, Partial<OpenAPI.ParameterObject>>> = {},
): Param[] => {
  const shape = getShape(schema);

  return Object.keys(shape).reduce((acc, paramName): Param[] => {
    const paramSchema = shape[paramName];
    const extraDoc = extraDocumentation[paramName as keyof T];
    const initialTypeName = getTypeName(paramSchema);
    const required = initialTypeName !== "ZodOptional";

    const schema = zodToOpenApi(
      required ? paramSchema : paramSchema._def.innerType,
    ) as any;

    return [
      ...acc,
      {
        ...extraDoc,
        in: paramKind,
        name: paramName,
        required,
        schema,
      },
    ];
  }, [] as Param[]);
};

const getTypeName = <T>(schema: z.Schema<T>): ZodFirstPartyTypeKind | undefined =>
  (schema._def as any).typeName;

const getShape = <T>(schema: z.Schema<T>): ZodRawShape => (schema._def as any).shape();
