import type { HttpMethod, HttpResponse, UnknownSharedRoute, Url } from "..";
import { configureCreateHttpClient, HandlerCreator } from "..";

import type { SuperTest, Test } from "supertest";

const supertestRequestToCorrectHttpMethod = (
  supertestRequest: SuperTest<Test>,
  method: HttpMethod,
): ((url: Url) => Test) => supertestRequest[method];

export const createSupertestHandlerCreator =
  (supertestRequest: SuperTest<Test>): HandlerCreator<any> =>
  (routeName, routes, replaceParamsInUrl) => {
    const route = routes[routeName];
    return async ({ headers, body, queryParams, urlParams } = {}): Promise<
      HttpResponse<any, any>
    > => {
      const queryParamsWithCorrectArrays = Object.fromEntries(
        Object.entries(queryParams ?? {}).map(([key, value]) => [
          Array.isArray(value) ? `${key}[]` : key,
          value,
        ]),
      );

      const result = await supertestRequestToCorrectHttpMethod(
        supertestRequest,
        route.method,
      )(replaceParamsInUrl(route.url, urlParams))
        .send(body as any)
        .set(headers ?? {})
        .query(queryParamsWithCorrectArrays);

      return {
        status: result.status,
        body: result.body,
        ...(!Object.keys(route.responses).includes(result.status.toString()) && {
          text: result.text,
        }),
        headers: result.headers,
      };
    };
  };

export const createSupertestSharedClient = <
  SharedRoutes extends Record<string, UnknownSharedRoute>,
>(
  sharedRoutes: SharedRoutes,
  supertestRequest: SuperTest<Test>,
) =>
  configureCreateHttpClient(createSupertestHandlerCreator(supertestRequest))(
    sharedRoutes,
  );
