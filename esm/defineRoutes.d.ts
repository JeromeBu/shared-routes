import { z, ZodVoid } from "zod";
import { HttpResponse } from "./configureCreateHttpClient.mjs";
import type { Url } from "./pathParameters.mjs";
export type UnknownResponses = {
    [K: number]: z.ZodSchema<unknown>;
};
export type ValueOf<T> = T[keyof T];
export type ValueOfIndexNumber<T extends Record<number, unknown>> = T[keyof T & number];
export type ResponsesToHttpResponse<Responses extends UnknownResponses> = ValueOf<{
    [K in keyof Responses & number]: HttpResponse<K, z.infer<Responses[K]>>;
}>;
export type ResponseType = "json" | "arrayBuffer" | "blob" | "text";
type OptionalFields<RequestBody, Query, Responses extends UnknownResponses, Headers> = {
    requestBodySchema?: z.Schema<RequestBody>;
    queryParamsSchema?: z.Schema<Query>;
    responses?: Responses;
    headersSchema?: z.Schema<Headers>;
    responseType?: ResponseType;
};
export type HttpMethod = "get" | "post" | "put" | "patch" | "delete";
type MethodAndUrl<U extends Url> = {
    method: HttpMethod;
    url: U;
};
type SharedRouteWithOptional<U extends Url, RequestBody, Query, Responses extends UnknownResponses, Headers> = MethodAndUrl<U> & OptionalFields<RequestBody, Query, Responses, Headers>;
export type SharedRoute<U extends Url, RequestBody, Query, Responses extends UnknownResponses, Headers> = MethodAndUrl<U> & Required<OptionalFields<RequestBody, Query, Responses, Headers>>;
export type UnknownSharedRoute = SharedRoute<Url, unknown, unknown, UnknownResponses, unknown>;
export type UnknownSharedRouteWithUrl<U extends Url> = SharedRoute<U, unknown, unknown, UnknownResponses, unknown>;
export declare const defineRoute: <U extends Url, RequestBody = void, Query = void, Responses extends UnknownResponses = {
    201: ZodVoid;
}, Headers_1 = void>(route: SharedRouteWithOptional<U, RequestBody, Query, Responses, Headers_1>) => SharedRoute<U, RequestBody, Query, Responses, Headers_1>;
export declare const defineRoutes: <T extends Record<string, UnknownSharedRoute>>(routes: { [K in keyof T]: T[K]; }) => { [K in keyof T]: T[K]; };
export declare const listRoutes: <T extends Record<string, UnknownSharedRoute>>(routes: { [K in keyof T]: T[K]; }) => string[];
export {};
