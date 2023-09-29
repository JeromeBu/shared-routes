import type { HttpResponse, UnknownSharedRoute, Url } from "..";
import { configureCreateHttpClient, HandlerCreator } from "..";
import { ResponseType } from "../defineRoutes";
import { queryParamsToString } from "./queryParamsToString";
import type nodeFetch from "node-fetch";
import type { Response as FetchResponse } from "node-fetch";
import {
  ValidationOptions,
  validateInputParams,
  validateSchemaWithExplicitError,
} from "../validations";

const objectFromEntries = (
  entries: Iterable<[string, string]>,
): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const [key, value] of entries) {
    result[key] = value;
  }
  return result;
};

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
      : validateInputParams(route, params as any, "fetch", { withIssuesInMessage: true });

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
      : validateSchemaWithExplicitError({
          adapterName: "fetch",
          checkedSchema: "responses",
          responseStatus: res.status as any,
          params: processedBody,
          route,
          withIssuesInMessage: true,
        });

    return {
      body: responseBody,
      status: res.status,
      headers: objectFromEntries(res.headers.entries()),
    };
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
