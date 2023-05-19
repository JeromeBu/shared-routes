import { z } from "zod";
import type { SharedRoute, UnknownSharedRoute } from "./defineRoutes.mjs";
import { PathParameters, ReplaceParamsInUrl, Url } from "./pathParameters.mjs";
type AnyObj = Record<string, unknown>;
type EmptyObj = Record<string, never>;
export type HttpResponse<ResponseBody> = {
    status: number;
    body: ResponseBody;
};
type HandlerParams<SharedRoute extends UnknownSharedRoute> = (PathParameters<SharedRoute["url"]> extends EmptyObj ? AnyObj : {
    urlParams: PathParameters<SharedRoute["url"]>;
}) & (z.infer<SharedRoute["requestBodySchema"]> extends void ? AnyObj : {
    body: z.infer<SharedRoute["requestBodySchema"]>;
}) & (z.infer<SharedRoute["queryParamsSchema"]> extends void ? AnyObj : {
    queryParams: z.infer<SharedRoute["queryParamsSchema"]>;
}) & (z.infer<SharedRoute["headersSchema"]> extends void ? AnyObj : {
    headers: z.infer<SharedRoute["headersSchema"]>;
});
export type Handler<SharedRoute extends UnknownSharedRoute> = (params: HandlerParams<SharedRoute> | EmptyObj) => Promise<HttpResponse<z.infer<SharedRoute["responseBodySchema"]>>>;
export type HttpClient<SharedRoutes extends Record<string, UnknownSharedRoute>> = {
    [RouteName in keyof SharedRoutes]: (...params: [SharedRoutes[RouteName], PathParameters<SharedRoutes[RouteName]["url"]>] extends [SharedRoute<Url, void, void, unknown, void>, EmptyObj] ? [] : [HandlerParams<SharedRoutes[RouteName]>]) => Promise<HttpResponse<z.infer<SharedRoutes[RouteName]["responseBodySchema"]>>>;
};
export type HandlerCreator<SharedRoutes extends Record<string, UnknownSharedRoute>> = <R extends keyof SharedRoutes>(routeName: R, routes: SharedRoutes, replaceParamsInUrl: ReplaceParamsInUrl) => Handler<SharedRoutes[R]>;
export declare const configureCreateHttpClient: <S extends Record<string, UnknownSharedRoute>>(handlerCreator: HandlerCreator<S>) => <SharedRoutes extends Record<string, UnknownSharedRoute>>(routes: SharedRoutes) => HttpClient<SharedRoutes>;
export {};
