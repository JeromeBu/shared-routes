import type { HttpResponse, UnknownSharedRoute, Url } from "../index.ts";
import { configureCreateHttpClient, HandlerCreator } from "../index.ts";
import { queryParamsToString } from "./queryParamsToString.ts";
import type nodeFetch from "npm:node-fetch@3.3.1";
import {
  ValidationOptions,
  validateInputParams,
  validateSchemaWithExplictError,
} from "../validations.ts";

declare function browserFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response>;

type Fetch = typeof browserFetch | typeof nodeFetch;

type FetchConfig = RequestInit & { baseURL?: Url } & ValidationOptions;

export const createFetchHandlerCreator =
  <SharedRoutes extends Record<string, UnknownSharedRoute>>(
    fetch: Fetch,
    options: FetchConfig = {},
  ): HandlerCreator<SharedRoutes> =>
  (routeName, routes, replaceParamsInUrl) =>
  async ({ urlParams, ...params } = {}): Promise<HttpResponse<any>> => {
    const route = routes[routeName];

    const { body, headers, queryParams } = options.skipInputValidation
      ? params
      : validateInputParams(route, params as any, "fetch");

    const bodyAsString = JSON.stringify(body);

    const stringQueryParams =
      queryParams && Object.keys(queryParams).length > 0
        ? "?" + queryParamsToString(queryParams as any)
        : "";

    const { baseURL, ...defaultInit } = options;

    const res = await fetch(
      (baseURL ? baseURL : "") +
        replaceParamsInUrl(route.url, urlParams as Url) +
        stringQueryParams,
      {
        ...(defaultInit as any),
        method: route.method,
        ...(bodyAsString !== "{}" ? { body: bodyAsString } : {}),
        headers: {
          "Content-Type": "application/json",
          ...defaultInit?.headers,
          ...(headers ?? {}),
        },
      },
    );
    const json = await res.json();

    const responseBody = options.skipResponseValidation
      ? json
      : validateSchemaWithExplictError({
          adapterName: "fetch",
          checkedSchema: "responseBodySchema",
          params: json,
          route,
        });

    return { body: responseBody, status: res.status };
  };

export const createFetchSharedClient = <
  SharedRoutes extends Record<string, UnknownSharedRoute>,
>(
  sharedRouters: SharedRoutes,
  fetch: Fetch,
  config: FetchConfig = {},
) => configureCreateHttpClient(createFetchHandlerCreator(fetch, config))(sharedRouters);
