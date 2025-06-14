import type { HttpResponse, UnknownSharedRoute, Url } from "..";
import { configureCreateHttpClient, HandlerCreator } from "..";
import { convertToFormData } from "./convertToFormData";
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

type FetchConfig = RequestInit & { baseURL?: Url; timeout?: number } & HttpClientOptions;

export const makeBodyToSend = (
  body: Record<string, any> | undefined,
  contentType: string | undefined,
): string | undefined => {
  if (!body || Object.keys(body).length === 0) {
    return undefined;
  }

  switch (contentType) {
    case "application/x-www-form-urlencoded":
      return convertToFormData(body);
    case "application/json":
    default:
      return JSON.stringify(body);
  }
};

const getTimeoutUtils = (timeoutDurationMs: number | undefined) => {
  if (!timeoutDurationMs) return { cleanup: () => {} };

  const controller = new AbortController();
  const { signal } = controller;
  const timeoutId = setTimeout(
    () => controller.abort(new Error(`timeout of ${timeoutDurationMs}ms exceeded`)),
    timeoutDurationMs,
  );

  return { cleanup: () => clearTimeout(timeoutId), signal };
};

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

    const stringQueryParams =
      queryParams && Object.keys(queryParams).length > 0
        ? "?" + convertToFormData(queryParams as any)
        : "";

    const { baseURL, timeout, ...defaultInit } = options;

    const headersToSend = {
      "Content-Type": "application/json",
      ...defaultInit?.headers,
      ...(headers ?? {}),
    };

    const bodyAsString = makeBodyToSend(
      body as Record<string, any>,
      headersToSend["Content-Type"],
    );

    const queryStartTime = Date.now();
    const { signal, cleanup } = getTimeoutUtils(timeout);
    const res = await fetch(
      (baseURL ? baseURL : "") +
        replaceParamsInUrl(route.url, urlParams as Url) +
        stringQueryParams,
      {
        signal,
        ...(defaultInit as any),
        method: route.method.toUpperCase(),
        ...(bodyAsString !== "{}" ? { body: bodyAsString } : {}),
        headers: headersToSend,
      },
    ).catch((e) => {
      if (options?.onResponseSideEffect) {
        options.onResponseSideEffect({
          response: {
            status: null,
            body: e.message,
            headers: {},
          },
          durationInMs: Date.now() - queryStartTime,
          route,
          input: {
            body,
            queryParams,
            urlParams,
          },
        });
      }
      throw e;
    });
    cleanup();

    const headersAsObject = objectFromEntries((res.headers as any).entries());
    const processedBody = await responseTypeToResponseBody(res);

    if (options?.onResponseSideEffect) {
      options.onResponseSideEffect({
        response: {
          status: res.status,
          body: processedBody,
          headers: headersAsObject,
        },
        durationInMs: Date.now() - queryStartTime,
        route,
        input: {
          body,
          queryParams,
          urlParams,
        },
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

const responseTypeToResponseBody = (res: Response) => {
  const contentType = res.headers.get("content-type")?.toLowerCase() || "";

  if (
    contentType.includes("application/json") ||
    contentType.includes("application/ld+json")
  ) {
    return res.json();
  }

  // Binary/blob types
  if (
    contentType.includes("image/") ||
    contentType.includes("audio/") ||
    contentType.includes("video/") ||
    contentType.includes("application/pdf") ||
    contentType.includes("application/zip") ||
    contentType.includes("application/octet-stream") ||
    contentType.includes("application/vnd.")
  ) {
    return res.blob();
  }

  // Form data
  if (contentType.includes("multipart/form-data")) {
    return res.formData();
  }

  // ArrayBuffer for binary data that needs processing
  if (
    contentType.includes("application/java-archive") ||
    contentType.includes("application/x-shockwave-flash")
  ) {
    return res.arrayBuffer();
  }

  // Default to text for everything else (html, plain text, xml, css, etc)
  return res.text();
};

export const createFetchSharedClient = <
  SharedRoutes extends Record<string, UnknownSharedRoute>,
>(
  sharedRouters: SharedRoutes,
  fetch: Fetch,
  config: FetchConfig = {},
) => configureCreateHttpClient(createFetchHandlerCreator(fetch, config))(sharedRouters);
