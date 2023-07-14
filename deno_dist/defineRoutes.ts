import { z, ZodVoid } from "npm:zod@3.21.4";
import type { Url } from "./pathParameters.ts";

export type UnknownResponses = { [K: number]: z.ZodSchema<unknown> };

export type ValueOf<T> = T[keyof T];

export type ResponsesToHttpResponse<Responses extends UnknownResponses> = ValueOf<
  {
    [K in keyof Responses]: { status: K; body: z.infer<Responses[K]> };
  }
>;

// const responses = {
//   200: z.object({ foo: z.string() }),
//   400: z.object({ bar: z.string() }),
// } satisfies UnknownResponses;

// z.infer<SharedRoutes[Route]["responses"][number]>,
// type MyResponses = typeof responses;

// type AcceptedResponse = ResponsesToHttpResponse<MyResponses>
// declare const a: AcceptedResponse
// if(a.status === 200) {
//   a.body.foo
// }

type OptionalFields<RequestBody, Query, Responses extends UnknownResponses, Headers> = {
  requestBodySchema?: z.Schema<RequestBody>;
  queryParamsSchema?: z.Schema<Query>;
  responses?: Responses;
  headersSchema?: z.Schema<Headers>;
};

export type HttpMethod = "get" | "post" | "put" | "patch" | "delete";
type MethodAndUrl<U extends Url> = {
  method: HttpMethod;
  url: U;
};

type SharedRouteWithOptional<
  U extends Url,
  RequestBody,
  Query,
  Responses extends UnknownResponses,
  Headers,
> = MethodAndUrl<U> & OptionalFields<RequestBody, Query, Responses, Headers>;

export type SharedRoute<
  U extends Url,
  RequestBody,
  Query,
  Responses extends UnknownResponses,
  Headers,
> = MethodAndUrl<U> & Required<OptionalFields<RequestBody, Query, Responses, Headers>>;

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
  RequestBody = void,
  Query = void,
  Responses extends UnknownResponses = { 201: ZodVoid },
  Headers = void,
>(
  route: SharedRouteWithOptional<U, RequestBody, Query, Responses, Headers>,
): SharedRoute<U, RequestBody, Query, Responses, Headers> => ({
  requestBodySchema: z.object({}).strict() as any,
  queryParamsSchema: z.object({}).strict() as any,
  responses: { 201: z.void() } as any,
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
