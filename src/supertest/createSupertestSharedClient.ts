import type { HttpMethod, UnknownSharedRoute, Url } from "..";
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
    return async ({ headers, body, queryParams, urlParams } = {}): Promise<any> => {
      const result = await supertestRequestToCorrectHttpMethod(
        supertestRequest,
        route.method,
      )(replaceParamsInUrl(route.url, urlParams))
        .send(body)
        .set(headers ?? {})
        .query(queryParams);

      return {
        status: result.status,
        body: result.body,
        ...(!Object.keys(route.responses).includes(result.status.toString()) && {
          text: result.text,
        }),
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
