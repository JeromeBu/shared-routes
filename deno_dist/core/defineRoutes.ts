import { z } from "npm:zod@3.21.4";
import type { Url } from "./pathParameters.ts";

type OptionalFields<Body, Query, ResponseBody, Headers> = {
  bodySchema?: z.Schema<Body>;
  queryParamsSchema?: z.Schema<Query>;
  responseBodySchema?: z.Schema<ResponseBody>;
  headersSchema?: z.Schema<Headers>;
};

export type HttpMethod = "get" | "post" | "put" | "patch" | "delete";
type MethodAndUrl<U extends Url> = {
  method: HttpMethod;
  url: U;
};

type SharedRouteWithOptional<
  U extends Url,
  Body,
  Query,
  ResponseBody,
  Headers,
> = MethodAndUrl<U> & OptionalFields<Body, Query, ResponseBody, Headers>;

export type SharedRoute<
  U extends Url,
  Body,
  Query,
  ResponseBody,
  Headers,
> = MethodAndUrl<U> & Required<OptionalFields<Body, Query, ResponseBody, Headers>>;

export type UnknownSharedRoute = SharedRoute<Url, unknown, unknown, unknown, unknown>;
export type UnknownSharedRouteWithUrl<U extends Url> = SharedRoute<
  U,
  unknown,
  unknown,
  unknown,
  unknown
>;

export const defineRoute = <
  U extends Url,
  Body = void,
  Query = void,
  ResponseBody = void,
  Headers = void,
>(
  route: SharedRouteWithOptional<U, Body, Query, ResponseBody, Headers>,
): SharedRoute<U, Body, Query, ResponseBody, Headers> => ({
  bodySchema: z.object({}).strict() as any,
  queryParamsSchema: z.object({}).strict() as any,
  responseBodySchema: z.void() as any,
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
    const name = `${route.method.toUpperCase()} ${route.url.toLowerCase()}`;
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
