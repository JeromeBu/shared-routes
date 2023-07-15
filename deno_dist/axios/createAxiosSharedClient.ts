import type { AxiosInstance, ResponseType as AxiosResponseType } from "npm:axios@1.4.0";
import type { UnknownSharedRoute, Url } from "../index.ts";
import { configureCreateHttpClient, HandlerCreator } from "../index.ts";
import { ResponseType } from "../defineRoutes.ts";
import {
  ValidationOptions,
  validateInputParams,
  validateSchemaWithExplictError,
} from "../validations.ts";

const toAxiosResponseType: Record<ResponseType, AxiosResponseType> = {
  arrayBuffer: "arraybuffer",
  blob: "blob",
  json: "json",
  text: "text",
};

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
      responseType: toAxiosResponseType[route.responseType],
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
