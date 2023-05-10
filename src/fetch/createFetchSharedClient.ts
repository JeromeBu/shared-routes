import type { RequestInfo, RequestInit, Response } from "node-fetch";
import type { HttpResponse, UnknownSharedRoute, Url } from "..";
import { configureCreateHttpClient, HandlerCreator } from "..";
import { queryParamsToString } from "./queryParamsToString";

type Fetch = (url: URL | RequestInfo, init?: RequestInit) => Promise<Response>;

export const createFetchHandlerCreator =
  <SharedRoutes extends Record<string, UnknownSharedRoute>>(
    fetch: Fetch,
  ): HandlerCreator<SharedRoutes> =>
  (routeName, routes, replaceParamsInUrl) =>
  async ({ body, urlParams, queryParams, headers } = {}): Promise<HttpResponse<any>> => {
    const route = routes[routeName];

    const stringQueryParams =
      queryParams && Object.keys(queryParams).length === 0
        ? "?" + queryParamsToString(queryParams as any)
        : "";

    const res = await fetch(
      replaceParamsInUrl(route.url, urlParams as Url) + stringQueryParams,
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
) => configureCreateHttpClient(createFetchHandlerCreator(fetch))(sharedRouters);
