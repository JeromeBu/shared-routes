import type { AxiosInstance } from "axios";
import type { UnknownSharedRoute, Url } from "..";
import { configureCreateHttpClient, HandlerCreator } from "..";
import {
  ValidationOptions,
  validateInputParams,
  validateSchemaWithExplictError,
} from "../validations";

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

    const { data, status, ...rest } = await axios.request({
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
          checkedSchema: "responses",
          responseStatus: status as any,
          params: data,
          route,
        });

    return { ...rest, status, body: responseBody };
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
