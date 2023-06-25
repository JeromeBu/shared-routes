import { OpenAPIV3 as OpenAPI } from "openapi-types";
import { keys, UnknownSharedRoute } from "..";
import { z } from "zod";
import type { ZodFirstPartyTypeKind, ZodRawShape } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

// const emptyDescription = " - ";

type CreateOpenApiGenerator = <
  SharedRoutesByTag extends { [T: string]: Record<string, UnknownSharedRoute> },
>(
  sharedRoutesByTag: SharedRoutesByTag,
  openApiRootDoc: Omit<OpenAPI.Document, "paths">,
) => (
  extraDataByRoute: Partial<
    {
      [Tag in keyof SharedRoutesByTag]: {
        [R in keyof SharedRoutesByTag[Tag]]: Omit<
          OpenAPI.PathItemObject,
          OpenAPI.HttpMethods
        > & {
          extraDocs: {
            body?: OpenAPI.BaseSchemaObject & {
              properties?: Partial<
                Record<
                  keyof z.infer<SharedRoutesByTag[Tag][R]["requestBodySchema"]>,
                  OpenAPI.BaseSchemaObject
                >
              >;
            };
            queryParams?: Partial<
              Record<
                keyof z.infer<SharedRoutesByTag[Tag][R]["queryParamsSchema"]>,
                Partial<OpenAPI.ParameterObject>
              >
            >;
            headerParams?: Partial<
              Record<
                keyof z.infer<SharedRoutesByTag[Tag][R]["headersSchema"]>,
                Partial<OpenAPI.ParameterObject>
              >
            >;

            responses: {
              [S in keyof SharedRoutesByTag[Tag][R]["responses"]]: OpenAPI.ResponseObject;
            };
          };
        };
      };
    }
  >,
) => OpenAPI.Document;

export const createOpenApiGenerator: CreateOpenApiGenerator =
  (sharedRoutesByTag, openApiRootDoc) => (extraDataByRoute) => ({
    ...openApiRootDoc,
    paths: keys(sharedRoutesByTag).reduce((rootAcc, tag) => {
      const sharedRoutes = sharedRoutesByTag[tag];

      return {
        ...rootAcc,
        ...keys(sharedRoutes).reduce((acc, routeName) => {
          const route = sharedRoutes[routeName];
          const { extraDocs, ...extraDataForRoute } =
            extraDataByRoute[tag]?.[routeName] ?? {};

          const { formattedUrl, pathParams } = extractFromUrl(route.url);

          const parameters = [
            ...(pathParams.length > 0 ? pathParams : []),
            ...(!isShapeObjectEmpty(route.queryParamsSchema)
              ? zodObjectToParameters(
                  route.queryParamsSchema,
                  "query",
                  extraDocs?.queryParams,
                )
              : []),
            ...(!isShapeObjectEmpty(route.headersSchema)
              ? zodObjectToParameters(
                  route.headersSchema,
                  "header",
                  extraDocs?.headerParams,
                )
              : []),
          ];

          return {
            ...acc,
            [formattedUrl]: {
              ...acc[formattedUrl],
              [route.method]: {
                ...extraDataForRoute,
                tags: [tag],
                ...(parameters.length > 0 && {
                  parameters,
                }),

                ...(!isShapeObjectEmpty(route.requestBodySchema) && {
                  requestBody: {
                    required: true,
                    content: {
                      "application/json": {
                        schema: {
                          ...extraDocs?.body,
                          ...zodToOpenApi(route.requestBodySchema),
                        },
                      },
                    },
                  },
                }),

                responses: keys(route.responses).reduce((acc, status) => {
                  const responseSchema = zodToOpenApi(route.responses[status]);
                  const responseSchemaType:
                    | OpenAPI.NonArraySchemaObjectType
                    | OpenAPI.ArraySchemaObjectType
                    | undefined = (responseSchema as any).type;

                  return {
                    ...acc,
                    [status.toString()]: {
                      ...extraDocs?.responses?.[status],
                      ...(responseSchemaType !== undefined && {
                        content: {
                          "application/json": {
                            schema: responseSchema,
                          },
                        },
                      }),
                    },
                  };
                }, {}),
              },
            },
          };
        }, {} as any),
      };
    }, {}),
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
