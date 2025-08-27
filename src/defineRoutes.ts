import { z } from "zod";
import type { Url } from "./pathParameters";
import { StandardSchemaV1 } from "./standardSchemaUtils";

export type UnknownResponses = { [K: number]: StandardSchemaV1<unknown> };

export type ValueOf<T> = T[keyof T];
export type ValueOfIndexNumber<T extends Record<number, unknown>> = T[keyof T & number];

type OptionalFields<
  RequestBody,
  QueryInput,
  Responses extends UnknownResponses,
  HeadersInput,
  QueryOutput,
  RequestBodyOutput,
  HeadersOutput,
> = {
  requestBodySchema?: StandardSchemaV1<RequestBody, RequestBodyOutput>;
  queryParamsSchema?: StandardSchemaV1<QueryInput, QueryOutput>;
  responses?: Responses;
  headersSchema?: StandardSchemaV1<HeadersInput, HeadersOutput>;
};

export type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

type MethodAndUrl<U extends Url> = {
  method: HttpMethod;
  url: U;
};

type SharedRouteWithOptional<
  U extends Url,
  RequestBodyInput,
  QueryInput,
  Responses extends UnknownResponses,
  HeadersInput,
  QueryOutput,
  RequestBodyOutput,
  HeadersOutput,
> = MethodAndUrl<U> &
  OptionalFields<
    RequestBodyInput,
    QueryInput,
    Responses,
    HeadersInput,
    QueryOutput,
    RequestBodyOutput,
    HeadersOutput
  >;

export type SharedRoute<
  U extends Url,
  RequestBodyInput,
  QueryInput,
  Responses extends UnknownResponses,
  HeadersInput,
  QueryOutput = QueryInput,
  RequestBodyOutput = RequestBodyInput,
  HeadersOutput = HeadersInput,
> = MethodAndUrl<U> &
  Required<
    OptionalFields<
      RequestBodyInput,
      QueryInput,
      Responses,
      HeadersInput,
      QueryOutput,
      RequestBodyOutput,
      HeadersOutput
    >
  >;

export type UnknownSharedRoute = SharedRoute<
  Url,
  unknown,
  unknown,
  UnknownResponses,
  unknown
>;
export type UnknownSharedRouteWithUrl<U extends Url> = SharedRoute<
  U,
  unknown,
  unknown,
  UnknownResponses,
  unknown
>;

export const defineRoute = <
  U extends Url,
  RequestBodyInput = void,
  QueryInput = void,
  Responses extends UnknownResponses = { 201: StandardSchemaV1<void> },
  HeadersInput = void,
  QueryOutput = QueryInput,
  RequestBodyOutput = RequestBodyInput,
  HeadersOutput = HeadersInput,
>(
  route: SharedRouteWithOptional<
    U,
    RequestBodyInput,
    QueryInput,
    Responses,
    HeadersInput,
    QueryOutput,
    RequestBodyOutput,
    HeadersOutput
  >,
): SharedRoute<
  U,
  RequestBodyInput,
  QueryInput,
  Responses,
  HeadersInput,
  QueryOutput,
  RequestBodyOutput,
  HeadersOutput
> => ({
  requestBodySchema: z.object({}).strict() as any,
  queryParamsSchema: z.object({}).strict() as any,
  responses: { 201: z.void().or(z.string().max(0)) } as any, // as some framework return "" instead of void (like express)
  headersSchema: z.object({}) as any,
  ...route,
});

const verifyRoutesUniqAndListRoutes = <T extends Record<string, UnknownSharedRoute>>(
  routes: {
    [K in keyof T]: T[K];
  },
): string[] => {
  const occurrencesByMethodAndUrl: Record<string, number> = {};

  for (const route of Object.values(routes) as UnknownSharedRoute[]) {
    const name = `${route.method.toUpperCase()} ${route.url}`;
    const occurrence = (occurrencesByMethodAndUrl[name] ?? 0) + 1;
    if (occurrence > 1)
      throw new Error(
        `You cannot have several routes with same http method and url, got: ${name} twice (at least)`,
      );
    occurrencesByMethodAndUrl[name] = occurrence;
  }
  return Object.keys(occurrencesByMethodAndUrl);
};

export const defineRoutes = <T extends Record<string, UnknownSharedRoute>>(
  routes: {
    [K in keyof T]: T[K];
  },
) => {
  verifyRoutesUniqAndListRoutes(routes);
  return routes;
};
export const listRoutes = <T extends Record<string, UnknownSharedRoute>>(
  routes: {
    [K in keyof T]: T[K];
  },
): string[] => verifyRoutesUniqAndListRoutes(routes);
