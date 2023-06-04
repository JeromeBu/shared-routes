import type { AxiosInstance } from "axios";
import type { UnknownSharedRoute, Url } from "..";
import { configureCreateHttpClient, HandlerCreator } from "..";
import { validateInputParams, validateSchemaWithExplictError } from "../validations";

export const createAxiosHandlerCreator =
  <SharedRoutes extends Record<string, UnknownSharedRoute>>(
    axios: AxiosInstance,
  ): HandlerCreator<SharedRoutes> =>
  (routeName, routes, replaceParamsInUrl) =>
  async ({ urlParams, ...params } = {}) => {
    const route = routes[routeName];

    const { body, headers, queryParams } = validateInputParams(
      route,
      params as any,
      "axios",
    );

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

    const responseBody = validateSchemaWithExplictError({
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
) => configureCreateHttpClient(createAxiosHandlerCreator(axios))(sharedRouters);
