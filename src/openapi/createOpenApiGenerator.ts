import { OpenAPIV3_1 as OpenAPI } from "openapi-types";
import { ZodFirstPartyTypeKind, ZodRawShape, ZodType } from "zod";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { keys, PathParameters, UnknownSharedRoute } from "..";
import { StandardSchemaV1 } from "../standardSchemaUtils";

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
  SecuritySchemeName extends string,
>(
  sharedRoutesByTag: SharedRoutesByTag,
  openApiRootDoc: Omit<OpenAPI.Document, "paths" | "components"> & {
    components?: OmitFromExisting<OpenAPI.ComponentsObject, "securitySchemes"> & {
      securitySchemes?: Record<SecuritySchemeName, OpenAPI.SecuritySchemeObject>;
    };
  },
) => (
  extraDataByRoute: Partial<
    {
      [Tag in keyof SharedRoutesByTag]: {
        [R in keyof SharedRoutesByTag[Tag]]: OmitFromExisting<
          OpenAPI.OperationObject,
          "parameters" | "responses" | "requestBody" | "security"
        > & {
          extraDocs: {
            securitySchemeToApply?: SecuritySchemeName[];
            urlParams?: PathParameters<SharedRoutesByTag[Tag][R]["url"]> extends Record<
              string,
              never
            >
              ? never
              : Record<
                  keyof PathParameters<SharedRoutesByTag[Tag][R]["url"]>,
                  ExtraDocParameter<string>
                >;

            body?: StandardSchemaV1.Infer<
              SharedRoutesByTag[Tag][R]["requestBodySchema"]
            > extends void
              ? never
              : OpenApiBody<
                  StandardSchemaV1.Infer<SharedRoutesByTag[Tag][R]["requestBodySchema"]>
                >;

            // prettier-ignore
            queryParams?: StandardSchemaV1.Infer<SharedRoutesByTag[Tag][R]["queryParamsSchema"]> extends void
              ? never
              : {
                [K in keyof StandardSchemaV1.Infer<SharedRoutesByTag[Tag][R]["queryParamsSchema"]>]:
                ExtraDocParameter<StandardSchemaV1.Infer<SharedRoutesByTag[Tag][R]["queryParamsSchema"]>[K]>
              };

            // prettier-ignore
            headerParams?: StandardSchemaV1.Infer<SharedRoutesByTag[Tag][R]["headersSchema"]> extends void
              ? never
              : {[K in keyof StandardSchemaV1.Infer<SharedRoutesByTag[Tag][R]["headersSchema"]>]:
                ExtraDocParameter<StandardSchemaV1.Infer<SharedRoutesByTag[Tag][R]["headersSchema"]>[K]>}

            responses: {
              [S in keyof SharedRoutesByTag[Tag][R]["responses"] &
                number]: OpenAPI.ResponseObject &
                WithExampleOrExamples<
                  StandardSchemaV1.Infer<SharedRoutesByTag[Tag][R]["responses"][S]>
                >;
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

const throwIfNotZodSchema = (schema: StandardSchemaV1<any>): z.Schema<any> => {
  if (!(schema instanceof ZodType))
    throw new Error("Only support Zod schemas are supported for OpenAPI generation");
  return schema as z.Schema<any>;
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

          const queryParamsZodSchema = throwIfNotZodSchema(route.queryParamsSchema);
          const headerZodSchema = throwIfNotZodSchema(route.headersSchema);

          const parameters = [
            ...(pathParams.length > 0 ? pathParams : []),
            ...(!isShapeObjectEmpty(queryParamsZodSchema)
              ? zodObjectToParameters(
                  queryParamsZodSchema,
                  "query",
                  extraDocs?.queryParams,
                )
              : []),
            ...(!isShapeObjectEmpty(headerZodSchema)
              ? zodObjectToParameters(headerZodSchema, "header", extraDocs?.headerParams)
              : []),
          ];

          const { withRequestBodyExemple, requestBodyDocs } = extractFromOpenApiBody(
            extraDocs?.body,
          );

          const requestBodySchema = throwIfNotZodSchema(route.requestBodySchema);

          return {
            ...acc,
            [formattedUrl]: {
              ...acc[formattedUrl],
              [route.method]: {
                ...extraDataForRoute,
                tags: [tag],
                ...(extraDocs?.securitySchemeToApply &&
                  securitySchemeNamesToSecurity(extraDocs.securitySchemeToApply)),
                ...(parameters.length > 0 && {
                  parameters,
                }),

                ...(!isShapeObjectEmpty(requestBodySchema) && {
                  requestBody: {
                    required: true,
                    content: {
                      "application/json": {
                        ...withRequestBodyExemple,
                        schema: {
                          ...requestBodyDocs,
                          ...zodToOpenApi(requestBodySchema),
                        },
                      },
                    },
                  },
                }),

                responses: keys(route.responses).reduce((acc, status) => {
                  const responseZodSchema = throwIfNotZodSchema(route.responses[status]);
                  const responseSchema = zodToOpenApi(responseZodSchema);
                  const { example, examples, ...responseDoc } =
                    extraDocs?.responses?.[status] ?? {};

                  return {
                    ...acc,
                    [status.toString()]: {
                      ...responseDoc,
                      ...(typeof responseSchema === "object" && {
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
    return `{${group1}}` + group2;
  });

  return {
    formattedUrl,
    pathParams,
  };
};

const zodToOpenApi = (schema: ZodType<any>) => {
  const { $schema, additionalProperties, ...rest } = zodToJsonSchema(schema, {
    $refStrategy: "none",
  }) as any;
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

const securitySchemeNamesToSecurity = (securitySchemeToApply: string[]) => ({
  security: securitySchemeToApply.reduce(
    (securityAcc, securitySchemeName) => [...securityAcc, { [securitySchemeName]: [] }],
    [] as Record<string, string[]>[],
  ),
});

const getShape = <T>(schema: z.Schema<T>): ZodRawShape => (schema._def as any).shape();
