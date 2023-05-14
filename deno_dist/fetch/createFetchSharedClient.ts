import type { HttpResponse, UnknownSharedRoute, Url } from "../index.ts";
import { configureCreateHttpClient, HandlerCreator } from "../index.ts";
import { queryParamsToString } from "./queryParamsToString.ts";
import type nodeFetch from "npm:node-fetch@3.3.1";

declare function browserFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response>;

type Fetch = typeof browserFetch | typeof nodeFetch;

type FetchConfig = { baseURL?: Url };

export const createFetchHandlerCreator =
  <SharedRoutes extends Record<string, UnknownSharedRoute>>(
    fetch: Fetch,
    { baseURL }: FetchConfig = {},
  ): HandlerCreator<SharedRoutes> =>
  (routeName, routes, replaceParamsInUrl) =>
  async ({ body, urlParams, queryParams, headers } = {}): Promise<HttpResponse<any>> => {
    const route = routes[routeName];

    const stringQueryParams =
      queryParams && Object.keys(queryParams).length > 0
        ? "?" + queryParamsToString(queryParams as any)
        : "";

    const res = await fetch(
      (baseURL ? baseURL : "") +
        replaceParamsInUrl(route.url, urlParams as Url) +
        stringQueryParams,
      {
        method: route.method,
        ...(body ? { body: JSON.stringify(body) } : {}),
        headers: headers ?? ({} as any),
      },
    );
    const json = await res.json();

    return { body: json, status: res.status };
  };

export const createFetchSharedClient = <
  SharedRoutes extends Record<string, UnknownSharedRoute>,
>(
  sharedRouters: SharedRoutes,
  fetch: Fetch,
  config: FetchConfig = {},
) => configureCreateHttpClient(createFetchHandlerCreator(fetch, config))(sharedRouters);
