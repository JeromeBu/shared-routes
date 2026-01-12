import { OpenAPIV3_1 as OpenAPI } from "openapi-types";
import { type ZodRawShape, ZodType, z } from "zod";
import { keys, type PathParameters, type UnknownSharedRoute } from "..";
import type { StandardSchemaV1 } from "../standardSchemaUtils";

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
  extraDataByRoute: Partial<{
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
          queryParams?: StandardSchemaV1.Infer<
            SharedRoutesByTag[Tag][R]["queryParamsSchema"]
          > extends void
            ? never
            : {
                [K in keyof StandardSchemaV1.Infer<
                  SharedRoutesByTag[Tag][R]["queryParamsSchema"]
                >]: ExtraDocParameter<
                  StandardSchemaV1.Infer<
                    SharedRoutesByTag[Tag][R]["queryParamsSchema"]
                  >[K]
                >;
              };

          // biome-ignore format: better readability without formatting
          headerParams?: StandardSchemaV1.Infer<
						SharedRoutesByTag[Tag][R]["headersSchema"]
					> extends void
						? never
						: {
								[K in keyof StandardSchemaV1.Infer<
									SharedRoutesByTag[Tag][R]["headersSchema"]
								>]: ExtraDocParameter<
									StandardSchemaV1.Infer<
										SharedRoutesByTag[Tag][R]["headersSchema"]
									>[K]
								>;
							};

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
  }>,
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
            ...(shouldSkipParameterExtraction(queryParamsZodSchema)
              ? []
              : zodObjectToParameters(
                  queryParamsZodSchema,
                  "query",
                  extraDocs?.queryParams,
                )),
            ...(shouldSkipParameterExtraction(headerZodSchema)
              ? []
              : zodObjectToParameters(
                  headerZodSchema,
                  "header",
                  extraDocs?.headerParams,
                )),
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

                ...(!isSchemaEmpty(requestBodySchema) && {
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

const getDef = (schema: ZodType<any>) => (schema as any)._zod?.def || (schema as any).def;

const unwrapTransforms = (schema: ZodType<any>): ZodType<any> => {
  const typeName = getTypeName(schema);

  if (typeName === "transform" || typeName === "effect" || typeName === "pipe") {
    const def = getDef(schema);
    if (def?.in) {
      return unwrapTransforms(def.in);
    }
  }

  if (typeName === "object") {
    const shape = getShape(schema);
    if (shape) {
      const newShape = Object.keys(shape).reduce<Record<string, ZodType<any>>>(
        (acc, key) => ({
          ...acc,
          [key]: unwrapTransforms(shape[key] as ZodType<any>),
        }),
        {},
      );
      return z.object(newShape);
    }
  }

  if (typeName === "array") {
    const def = getDef(schema);
    if (def?.element) {
      return z.array(unwrapTransforms(def.element));
    }
  }

  if (typeName === "optional") {
    const def = getDef(schema);
    if (def?.innerType) {
      return unwrapTransforms(def.innerType).optional();
    }
  }

  if (typeName === "nullable") {
    const def = getDef(schema);
    if (def?.innerType) {
      return unwrapTransforms(def.innerType).nullable();
    }
  }

  return schema;
};

const handleVoidUnion = (options: any[]): Record<string, any> | null => {
  const hasVoid = options.some((option: any) => getTypeName(option) === "void");
  if (!hasVoid) return null;

  const nonVoidOptions = options.filter((option: any) => getTypeName(option) !== "void");

  if (nonVoidOptions.length === 0) {
    return { type: "null" };
  }

  return {
    anyOf: nonVoidOptions.map((option: any) => zodToOpenApi(option)),
  };
};

const zodToOpenApi = (schema: ZodType<any>): Record<string, any> => {
  const typeName = getTypeName(schema);

  if (typeName === "void") {
    return { type: "null" };
  }

  if (typeName === "transform" || typeName === "effect" || typeName === "pipe") {
    const def = getDef(schema);
    if (def?.in) {
      return zodToOpenApi(def.in);
    }
  }

  if (typeName === "union") {
    const options = getDef(schema)?.options || [];

    if (options.length === 0) {
      return { type: "object" };
    }

    const voidUnionResult = handleVoidUnion(options);
    if (voidUnionResult) {
      return voidUnionResult;
    }

    return {
      anyOf: options.map((option: any) => zodToOpenApi(option)),
    };
  }

  if (typeName === "discriminatedUnion") {
    const options = getDef(schema)?.options || [];

    if (options.length === 0) {
      return { type: "object" };
    }

    return {
      oneOf: options.map((option: any) => zodToOpenApi(option)),
    };
  }

  if (typeName === "intersection") {
    const def = getDef(schema);
    const left = def?.left;
    const right = def?.right;

    if (left && right) {
      return {
        allOf: [zodToOpenApi(left), zodToOpenApi(right)],
      };
    }
  }

  try {
    const unwrapped = unwrapTransforms(schema);
    const result = z.toJSONSchema(unwrapped) as any;
    const { $schema, ...rest } = result;

    if (rest.type === "object" && rest.additionalProperties === false) {
      rest.additionalProperties = undefined;
    }

    return rest;
  } catch (_error) {
    return { type: "object" };
  }
};

const shouldSkipParameterExtraction = <T>(schema: z.Schema<T>): boolean => {
  const typeName = getTypeName(schema);

  if (typeName === "object") {
    const shape = getShape(schema);
    return Object.keys(shape).length === 0;
  }

  if (typeName === "intersection") {
    const def = getDef(schema);
    const left = def?.left;
    const right = def?.right;

    if (!left || !right) return true;

    return shouldSkipParameterExtraction(left) && shouldSkipParameterExtraction(right);
  }

  if (typeName === "discriminatedUnion" || typeName === "union") {
    const options = getDef(schema)?.options || [];
    if (options.length === 0) return true;
    return options.every((option: z.Schema<any>) =>
      shouldSkipParameterExtraction(option),
    );
  }

  return true;
};

const isSchemaEmpty = <T>(schema: z.Schema<T>): boolean => {
  const typeName = getTypeName(schema);
  if (typeName === "object") {
    const shape = getShape(schema);
    return Object.keys(shape).length === 0;
  }

  return false;
};

const mergeIntersectionParameters = (
  left: z.Schema<any> | undefined,
  right: z.Schema<any> | undefined,
  paramKind: ParamKind,
  extraDocumentation: Partial<Record<string, Partial<OpenAPI.ParameterObject>>>,
): Param<unknown>[] => {
  const leftParams = left
    ? zodObjectToParameters(left, paramKind, extraDocumentation)
    : [];
  const rightParams = right
    ? zodObjectToParameters(right, paramKind, extraDocumentation)
    : [];

  const paramMap = new Map<string, Param<unknown>>();
  [...leftParams, ...rightParams].forEach((param) => paramMap.set(param.name, param));

  return Array.from(paramMap.values());
};

const mergeUnionParameters = (
  options: z.Schema<any>[],
  paramKind: ParamKind,
  extraDocumentation: Partial<Record<string, Partial<OpenAPI.ParameterObject>>>,
): Param<unknown>[] => {
  if (options.length === 0) return [];

  const allOptionParams = options.map((option) =>
    zodObjectToParameters(option, paramKind, extraDocumentation),
  );

  const paramPresence = new Map<string, { count: number; param: Param<unknown> }>();

  for (const optionParams of allOptionParams) {
    for (const param of optionParams) {
      const existing = paramPresence.get(param.name);
      if (existing) {
        existing.count++;
        if (!param.required) existing.param.required = false;
      } else {
        paramPresence.set(param.name, { count: 1, param: { ...param } });
      }
    }
  }

  return Array.from(paramPresence.values()).map(({ count, param }) => ({
    ...param,
    required: param.required && count === options.length,
  }));
};

const zodObjectToParameters = <T>(
  schema: z.Schema<T>,
  paramKind: ParamKind,
  extraDocumentation: Partial<Record<keyof T, Partial<OpenAPI.ParameterObject>>> = {},
): Param<unknown>[] => {
  const typeName = getTypeName(schema);

  if (typeName === "intersection") {
    const def = getDef(schema);
    return mergeIntersectionParameters(
      def?.left,
      def?.right,
      paramKind,
      extraDocumentation,
    );
  }

  if (typeName === "discriminatedUnion" || typeName === "union") {
    const options = getDef(schema)?.options || [];
    return mergeUnionParameters(options, paramKind, extraDocumentation);
  }

  if (typeName !== "object") {
    return [];
  }

  const shape = getShape(schema);
  if (!shape) {
    return [];
  }

  return Object.keys(shape).map((paramName): Param<unknown> => {
    const paramSchema = shape[paramName] as z.Schema<any>;
    const extraDoc = extraDocumentation[paramName as keyof T];
    const initialTypeName = getTypeName(paramSchema);
    const required = initialTypeName !== "optional";

    return {
      ...(extraDoc as any),
      in: paramKind,
      name: paramName,
      required,
      schema: zodToOpenApi(paramSchema) as any,
    };
  });
};

const getTypeName = <T>(schema: z.Schema<T>) => {
  // In Zod 4, ._def has moved to ._zod.def
  const def = (schema as any)._zod?.def || (schema as any).def;
  return def?.type;
};

const securitySchemeNamesToSecurity = (securitySchemeToApply: string[]) => ({
  security: securitySchemeToApply.reduce(
    (securityAcc, securitySchemeName) => [...securityAcc, { [securitySchemeName]: [] }],
    [] as Record<string, string[]>[],
  ),
});

const getShape = <T>(schema: z.Schema<T>): ZodRawShape => {
  // In Zod 4, ._def has moved to ._zod.def
  const def = (schema as any)._zod?.def || (schema as any).def;
  return def?.shape;
};
