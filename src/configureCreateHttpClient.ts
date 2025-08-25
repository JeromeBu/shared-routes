import type {
  ResponsesToHttpResponse,
  SharedRoute,
  UnknownResponses,
  UnknownSharedRoute,
} from "./defineRoutes";
import {
  keys,
  PathParameters,
  ReplaceParamsInUrl,
  replaceParamsInUrl,
  Url,
} from "./pathParameters";
import { StandardSchemaV1 } from "./standardSchemaUtils";

type EmptyObj = Record<string, never>;
type AnyObj = Record<string, unknown>;

export type HttpResponse<Status extends number | string | symbol, ResponseBody> = {
  status: Status;
  body: ResponseBody;
  headers: Record<string, unknown>;
};

// biome-ignore format: better readability without formatting
export type HandlerParams<SharedRoute extends UnknownSharedRoute> =
  (PathParameters<SharedRoute["url"]> extends EmptyObj ? AnyObj : { urlParams: PathParameters<SharedRoute["url"]>})
  & (StandardSchemaV1.Infer<SharedRoute["requestBodySchema"]> extends void ? AnyObj : { body: StandardSchemaV1.Infer<SharedRoute["requestBodySchema"]> })
  & (StandardSchemaV1.Infer<SharedRoute["queryParamsSchema"]> extends void ? AnyObj : { queryParams: StandardSchemaV1.Infer<SharedRoute["queryParamsSchema"]> })
  & (StandardSchemaV1.Infer<SharedRoute["headersSchema"]> extends void ? AnyObj : { headers: StandardSchemaV1.Infer<SharedRoute["headersSchema"]> })

export type Handler<SharedRoute extends UnknownSharedRoute> = (
  params: HandlerParams<SharedRoute> | EmptyObj,
) => Promise<ResponsesToHttpResponse<SharedRoute["responses"]>>;

export type HttpClient<SharedRoutes extends Record<string, UnknownSharedRoute>> = {
  [RouteName in keyof SharedRoutes]: (
    // biome-ignore format: better readability without formatting
    ...params: [SharedRoutes[RouteName], PathParameters<SharedRoutes[RouteName]["url"]>] extends [SharedRoute<Url, void, void, UnknownResponses, void>, EmptyObj]
      ? []
      : [HandlerParams<SharedRoutes[RouteName]>]
  ) => Promise<ResponsesToHttpResponse<SharedRoutes[RouteName]["responses"]>>;
};

export type HandlerCreator<SharedRoutes extends Record<string, UnknownSharedRoute>> = <
  R extends keyof SharedRoutes,
>(
  routeName: R,
  routes: SharedRoutes,
  replaceParamsInUrl: ReplaceParamsInUrl,
) => Handler<SharedRoutes[R]>;

export const configureCreateHttpClient =
  <S extends Record<string, UnknownSharedRoute>>(handlerCreator: HandlerCreator<S>) =>
  <SharedRoutes extends Record<string, UnknownSharedRoute>>(
    routes: SharedRoutes,
  ): HttpClient<SharedRoutes> =>
    keys(routes).reduce(
      (acc, routeName) => ({
        ...acc,
        [routeName]: handlerCreator(
          routeName as string,
          routes as unknown as S,
          replaceParamsInUrl,
        ),
      }),
      {} as HttpClient<SharedRoutes>,
    );
