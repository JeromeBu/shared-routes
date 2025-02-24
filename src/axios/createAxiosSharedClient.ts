import type { AxiosInstance } from "axios";
import type { UnknownSharedRoute, Url } from "..";
import { configureCreateHttpClient, HandlerCreator } from "..";
import {
  HttpClientOptions,
  validateInputParams,
  validateSchemaWithExplicitError,
} from "../validations";

export const createAxiosHandlerCreator =
  <SharedRoutes extends Record<string, UnknownSharedRoute>>(
    axios: AxiosInstance,
    options?: HttpClientOptions,
  ): HandlerCreator<SharedRoutes> =>
  (routeName, routes, replaceParamsInUrl) =>
  async ({ urlParams, ...params } = {}) => {
    const route = routes[routeName];

    const { body, headers, queryParams } = options?.skipInputValidation
      ? params
      : validateInputParams(route, params as any, "axios", { withIssuesInMessage: true });

    const queryStartTime = Date.now();
    const { data, status, ...rest } = await axios.request({
      method: route.method.toUpperCase(),
      url: replaceParamsInUrl(route.url, urlParams as Url),
      data: body,
      params: queryParams,
      headers: {
        ...axios.defaults.headers,
        ...(headers ?? ({} as any)),
      },
    });

    if (options?.onResponseSideEffect) {
      options.onResponseSideEffect({
        durationInMs: Date.now() - queryStartTime,
        response: {
          status,
          body: data,
          headers: rest.headers,
        },
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
      options?.skipResponseValidationForStatuses?.includes(status)
        ? data
        : validateSchemaWithExplicitError({
            adapterName: "axios",
            checkedSchema: "responses",
            responseStatus: status as any,
            params: data,
            route,
            withIssuesInMessage: true,
          });

    return { ...rest, status, body: responseBody };
  };

export const createAxiosSharedClient = <
  SharedRoutes extends Record<string, UnknownSharedRoute>,
>(
  sharedRouters: SharedRoutes,
  axios: AxiosInstance,
  validationOptions?: HttpClientOptions,
) =>
  configureCreateHttpClient(createAxiosHandlerCreator(axios, validationOptions))(
    sharedRouters,
  );
