import type { Url } from "./pathParameters.mjs";
import { StandardSchemaV1 } from "./standardSchemaUtils.mjs";
export type UnknownResponses = {
    [K: number]: StandardSchemaV1<unknown>;
};
export type ValueOf<T> = T[keyof T];
export type ValueOfIndexNumber<T extends Record<number, unknown>> = T[keyof T & number];
type OptionalFields<RequestBody, QueryInput, Responses extends UnknownResponses, HeadersInput, QueryOutput, RequestBodyOutput, HeadersOutput> = {
    requestBodySchema?: StandardSchemaV1<RequestBody, RequestBodyOutput>;
    queryParamsSchema?: StandardSchemaV1<QueryInput, QueryOutput>;
    responses?: Responses;
    headersSchema?: StandardSchemaV1<HeadersInput, HeadersOutput>;
};
export type HttpMethod = "get" | "post" | "put" | "patch" | "delete";
type MethodAndUrl<U extends Url> = {
    method: HttpMethod;
    url: U;
};
type SharedRouteWithOptional<U extends Url, RequestBodyInput, QueryInput, Responses extends UnknownResponses, HeadersInput, QueryOutput, RequestBodyOutput, HeadersOutput> = MethodAndUrl<U> & OptionalFields<RequestBodyInput, QueryInput, Responses, HeadersInput, QueryOutput, RequestBodyOutput, HeadersOutput>;
export type SharedRoute<U extends Url, RequestBodyInput, QueryInput, Responses extends UnknownResponses, HeadersInput, QueryOutput = QueryInput, RequestBodyOutput = RequestBodyInput, HeadersOutput = HeadersInput> = MethodAndUrl<U> & Required<OptionalFields<RequestBodyInput, QueryInput, Responses, HeadersInput, QueryOutput, RequestBodyOutput, HeadersOutput>>;
export type UnknownSharedRoute = SharedRoute<Url, unknown, unknown, UnknownResponses, unknown>;
export type UnknownSharedRouteWithUrl<U extends Url> = SharedRoute<U, unknown, unknown, UnknownResponses, unknown>;
export declare const defineRoute: <U extends Url, RequestBodyInput = void, QueryInput = void, Responses extends UnknownResponses = {
    201: StandardSchemaV1<void>;
}, HeadersInput = void, QueryOutput = QueryInput, RequestBodyOutput = RequestBodyInput, HeadersOutput = HeadersInput>(route: SharedRouteWithOptional<U, RequestBodyInput, QueryInput, Responses, HeadersInput, QueryOutput, RequestBodyOutput, HeadersOutput>) => SharedRoute<U, RequestBodyInput, QueryInput, Responses, HeadersInput, QueryOutput, RequestBodyOutput, HeadersOutput>;
export declare const defineRoutes: <T extends Record<string, UnknownSharedRoute>>(routes: { [K in keyof T]: T[K]; }) => { [K in keyof T]: T[K]; };
export declare const listRoutes: <T extends Record<string, UnknownSharedRoute>>(routes: { [K in keyof T]: T[K]; }) => string[];
export {};
