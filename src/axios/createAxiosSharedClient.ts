import type { AxiosInstance, ResponseType as AxiosResponseType } from "axios";
import type { UnknownSharedRoute, Url } from "..";
import { configureCreateHttpClient, HandlerCreator } from "..";
import { ResponseType } from "../defineRoutes";
import {
  ValidationOptions,
  validateInputParams,
  validateSchemaWithExplicitError,
} from "../validations";

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
      : validateInputParams(route, params as any, "axios", { withIssuesInMessage: true });

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
  validationOptions?: ValidationOptions,
) =>
  configureCreateHttpClient(createAxiosHandlerCreator(axios, validationOptions))(
    sharedRouters,
  );
