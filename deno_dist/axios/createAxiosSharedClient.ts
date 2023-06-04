import type { AxiosInstance } from "npm:axios@1.4.0";
import type { UnknownSharedRoute, Url } from "../index.ts";
import { configureCreateHttpClient, HandlerCreator } from "../index.ts";
import {
  ValidationOptions,
  validateInputParams,
  validateSchemaWithExplictError,
} from "../validations.ts";

export const createAxiosHandlerCreator =
  <SharedRoutes extends Record<string, UnknownSharedRoute>>(
    axios: AxiosInstance,
    options?: ValidationOptions,
  ): HandlerCreator<SharedRoutes> =>
  (routeName, routes, replaceParamsInUrl) =>
  async ({ urlParams, ...params } = {}) => {
    const route = routes[routeName];

    const { body, headers, queryParams } = options?.skipInputValidation
      ? params
      : validateInputParams(route, params as any, "axios");

    const { data, ...rest } = await axios.request({
      method: route.method,
      url: replaceParamsInUrl(route.url, urlParams as Url),
      data: body,
      params: queryParams,
      headers: {
        ...axios.defaults.headers,
        ...(headers ?? ({} as any)),
      },
    });

    const responseBody = options?.skipResponseValidation
      ? data
      : validateSchemaWithExplictError({
          adapterName: "axios",
          checkedSchema: "responseBodySchema",
          params: data,
          route,
        });

    return { ...rest, body: responseBody };
  };

export const createAxiosSharedClient = <
  SharedRoutes extends Record<string, UnknownSharedRoute>,
>(
  sharedRouters: SharedRoutes,
  axios: AxiosInstance,
  validationOptions?: ValidationOptions,
) =>
  configureCreateHttpClient(createAxiosHandlerCreator(axios, validationOptions))(
    sharedRouters,
  );
