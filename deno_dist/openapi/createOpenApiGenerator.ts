import { OpenAPIV3_1 as OpenAPI } from "npm:openapi-types@12.1.0";
import type { ZodFirstPartyTypeKind, ZodRawShape } from "npm:zod@3.21.4";
import { z } from "npm:zod@3.21.4";
import { zodToJsonSchema } from "npm:zod-to-json-schema@3.21.0";
import { keys, PathParameters, UnknownSharedRoute } from "../index.ts";

type OmitFromExisting<O, K extends keyof O> = Omit<O, K>;

type Examples<T> = {
  [media: string]: OpenAPI.ExampleObject & { value?: T };
};

type WithExampleOrExamples<T> =
  | { example?: T; examples?: never }
  | { example?: never; examples?: Examples<T> };

type OpenApiBody<T> = Pick<OpenAPI.BaseSchemaObject, "title" | "description"> & {
  example?: T;
  examples?: Examples<T>;
};

type ExtraDocParameter<T> = Partial<
  OmitFromExisting<
    OpenAPI.ParameterBaseObject,
    "example" | "examples" | "schema" | "required" | "content"
  >
> &
  WithExampleOrExamples<T>;

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
            urlParams?: PathParameters<SharedRoutesByTag[Tag][R]["url"]> extends Record<
              string,
              never
            >
              ? never
              : Record<
                  keyof PathParameters<SharedRoutesByTag[Tag][R]["url"]>,
                  ExtraDocParameter<string>
                >;

            body?: z.infer<SharedRoutesByTag[Tag][R]["requestBodySchema"]> extends void
              ? never
              : OpenApiBody<z.infer<SharedRoutesByTag[Tag][R]["requestBodySchema"]>>;

            // prettier-ignore
            queryParams?: z.infer<SharedRoutesByTag[Tag][R]["queryParamsSchema"]> extends void
              ? never
              : {
                [K in keyof z.infer<SharedRoutesByTag[Tag][R]["queryParamsSchema"]>]:
                ExtraDocParameter<z.infer<SharedRoutesByTag[Tag][R]["queryParamsSchema"]>[K]>
              };

            // prettier-ignore
            headerParams?: z.infer<SharedRoutesByTag[Tag][R]["headersSchema"]> extends void
              ? never
              : Partial<Record<
                  keyof z.infer<SharedRoutesByTag[Tag][R]["headersSchema"]>,
                  Partial<OpenAPI.ParameterObject>
                >>;

            responses: {
              [S in keyof SharedRoutesByTag[Tag][R]["responses"]]: OpenAPI.ResponseObject &
                WithExampleOrExamples<z.infer<SharedRoutesByTag[Tag][R]["responses"][S]>>;
            };
          };
        };
      };
    }
  >,
) => OpenAPI.Document;

const extractFromOpenApiBody = (
  openApiRequestBody: Record<string, any> | undefined = {},
): {
  withRequestBodyExemple: WithExampleOrExamples<unknown>;
  requestBodyDocs: Record<string, unknown>;
} => {
  const { examples, example, ...rest } = openApiRequestBody;

  return {
    withRequestBodyExemple: {
      ...(example && { example }),
      ...(examples && { examples }),
    },
    requestBodyDocs: rest,
  };
};

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

          const { formattedUrl, pathParams } = extractFromUrl(
            route.url,
            extraDocs?.urlParams,
          );

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

          const { withRequestBodyExemple, requestBodyDocs } = extractFromOpenApiBody(
            extraDocs?.body,
          );

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
                        ...withRequestBodyExemple,
                        schema: {
                          ...requestBodyDocs,
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

                  const { example, examples, ...responseDoc } =
                    extraDocs?.responses?.[status] ?? {};

                  return {
                    ...acc,
                    [status.toString()]: {
                      ...responseDoc,
                      ...(responseSchemaType !== undefined && {
                        content: {
                          "application/json": {
                            ...(example && { example }),
                            ...(examples && { examples }),
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

type Param<T> = ExtraDocParameter<T> & {
  name: string;
  required: boolean;
  schema: { type: string };
  in: ParamKind;
};

const extractFromUrl = (
  url: string,
  extraUrlParameters?: Record<string, ExtraDocParameter<unknown>>,
): { pathParams: Param<unknown>[]; formattedUrl: string } => {
  const pathParams: Param<unknown>[] = [];

  const formattedUrl = url.replace(/:(.*?)(\/|$)/g, (_match, group1, group2) => {
    const extraDocForParam = extraUrlParameters?.[group1];
    pathParams.push({
      ...extraDocForParam,
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
): Param<unknown>[] => {
  const shape = getShape(schema);

  return Object.keys(shape).reduce((acc, paramName): Param<unknown>[] => {
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
        ...(extraDoc as any),
        in: paramKind,
        name: paramName,
        required,
        schema,
      },
    ];
  }, [] as Param<unknown>[]);
};

const getTypeName = <T>(schema: z.Schema<T>): ZodFirstPartyTypeKind | undefined =>
  (schema._def as any).typeName;

const getShape = <T>(schema: z.Schema<T>): ZodRawShape => (schema._def as any).shape();
