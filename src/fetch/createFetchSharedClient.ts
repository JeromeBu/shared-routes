import type { HttpResponse, UnknownSharedRoute, Url } from "..";
import { configureCreateHttpClient, HandlerCreator } from "..";
import { ResponseType } from "../defineRoutes";
import { queryParamsToString } from "./queryParamsToString";
import {
  HttpClientOptions,
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

type Fetch = typeof fetch;

type FetchConfig = RequestInit & { baseURL?: Url } & HttpClientOptions;

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

    const queryStartTime = Date.now();
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

    const headersAsObject = objectFromEntries((res.headers as any).entries());

    if (options?.onResponseSideEffect) {
      options.onResponseSideEffect({
        status: res.status,
        body: processedBody,
        headers: headersAsObject,
        durationInMs: Date.now() - queryStartTime,
      });
    }

    const responseBody =
      options?.skipResponseValidation ||
      options?.skipResponseValidationForStatuses?.includes(res.status)
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
      headers: headersAsObject,
    };
  };

const responseTypeToResponseBody = (res: Response, responseType: ResponseType) => {
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
