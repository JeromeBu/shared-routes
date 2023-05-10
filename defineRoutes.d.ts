import { z } from "zod";
import type { Url } from "./pathParameters";
type OptionalFields<RequestBody, Query, ResponseBody, Headers> = {
    requestBodySchema?: z.Schema<RequestBody>;
    queryParamsSchema?: z.Schema<Query>;
    responseBodySchema?: z.Schema<ResponseBody>;
    headersSchema?: z.Schema<Headers>;
};
export type HttpMethod = "get" | "post" | "put" | "patch" | "delete";
type MethodAndUrl<U extends Url> = {
    method: HttpMethod;
    url: U;
};
type SharedRouteWithOptional<U extends Url, RequestBody, Query, ResponseBody, Headers> = MethodAndUrl<U> & OptionalFields<RequestBody, Query, ResponseBody, Headers>;
export type SharedRoute<U extends Url, RequestBody, Query, ResponseBody, Headers> = MethodAndUrl<U> & Required<OptionalFields<RequestBody, Query, ResponseBody, Headers>>;
export type UnknownSharedRoute = SharedRoute<Url, unknown, unknown, unknown, unknown>;
export type UnknownSharedRouteWithUrl<U extends Url> = SharedRoute<U, unknown, unknown, unknown, unknown>;
export declare const defineRoute: <U extends Url, RequestBody = void, Query = void, ResponseBody = void, Headers_1 = void>(route: SharedRouteWithOptional<U, RequestBody, Query, ResponseBody, Headers_1>) => SharedRoute<U, RequestBody, Query, ResponseBody, Headers_1>;
export declare const defineRoutes: <T extends Record<string, UnknownSharedRoute>>(routes: { [K in keyof T]: T[K]; }) => { [K in keyof T]: T[K]; };
export declare const listRoutes: <T extends Record<string, UnknownSharedRoute>>(routes: { [K in keyof T]: T[K]; }) => string[];
export {};
