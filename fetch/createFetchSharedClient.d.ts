import type { UnknownSharedRoute, Url } from "..";
import { HandlerCreator } from "..";
import { HttpClientOptions } from "../validations";
type Fetch = typeof fetch;
type FetchConfig = RequestInit & {
    baseURL?: Url;
    timeout?: number;
} & HttpClientOptions;
export declare const makeBodyToSend: (body: Record<string, any> | undefined, contentType: string | undefined) => string | undefined;
export declare const createFetchHandlerCreator: <SharedRoutes extends Record<string, UnknownSharedRoute>>(fetch: Fetch, options?: FetchConfig) => HandlerCreator<SharedRoutes>;
export declare const createFetchSharedClient: <SharedRoutes extends Record<string, UnknownSharedRoute>>(sharedRouters: SharedRoutes, fetch: Fetch, config?: FetchConfig) => import("..").HttpClient<SharedRoutes>;
export {};
