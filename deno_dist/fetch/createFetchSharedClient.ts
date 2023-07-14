import type { HttpResponse, UnknownSharedRoute, Url } from "../index.ts";
import { configureCreateHttpClient, HandlerCreator } from "../index.ts";
import { ResponseType } from "../defineRoutes.ts";
import { queryParamsToString } from "./queryParamsToString.ts";
import type nodeFetch from "npm:node-fetch@3.3.1";
import type { Response as FetchResponse } from "npm:node-fetch@3.3.1";
import {
  ValidationOptions,
  validateInputParams,
  validateSchemaWithExplictError,
} from "../validations.ts";

declare function browserFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<FetchResponse>;

type Fetch = typeof browserFetch | typeof nodeFetch;

type FetchConfig = RequestInit & { baseURL?: Url } & ValidationOptions;

export const createFetchHandlerCreator =
  <SharedRoutes extends Record<string, UnknownSharedRoute>>(
    fetch: Fetch,
    options: FetchConfig = {},
  ): HandlerCreator<SharedRoutes> =>
  (routeName, routes, replaceParamsInUrl) =>
  async ({ urlParams, ...params } = {}): Promise<HttpResponse<any, any>> => {
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

    const processedBody = await responseTypeToResponseBody(res, route.responseType);

    const responseBody = options.skipResponseValidation
      ? processedBody
      : validateSchemaWithExplictError({
          adapterName: "fetch",
          checkedSchema: "responses",
          responseStatus: res.status as any,
          params: processedBody,
          route,
        });

    return { body: responseBody, status: res.status };
  };

const responseTypeToResponseBody = (res: FetchResponse, responseType: ResponseType) => {
  switch (responseType) {
    case "json":
      return res.json();
    case "text":
      return res.text();
    case "blob":
      return res.blob();
    case "arrayBuffer":
      return res.arrayBuffer();
    default: {
      const exhaustiveCheck: never = responseType;
      return exhaustiveCheck;
    }
  }
};

export const createFetchSharedClient = <
  SharedRoutes extends Record<string, UnknownSharedRoute>,
>(
  sharedRouters: SharedRoutes,
  fetch: Fetch,
  config: FetchConfig = {},
) => configureCreateHttpClient(createFetchHandlerCreator(fetch, config))(sharedRouters);
