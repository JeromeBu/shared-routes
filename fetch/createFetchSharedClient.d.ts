import type { UnknownSharedRoute, Url } from "..";
import { HandlerCreator } from "..";
import { HttpClientOptions } from "../validations";
type Fetch = typeof fetch;
type FetchConfig = RequestInit & {
    baseURL?: Url;
} & HttpClientOptions;
export declare const createFetchHandlerCreator: <SharedRoutes extends Record<string, UnknownSharedRoute>>(fetch: Fetch, options?: FetchConfig) => HandlerCreator<SharedRoutes>;
export declare const createFetchSharedClient: <SharedRoutes extends Record<string, UnknownSharedRoute>>(sharedRouters: SharedRoutes, fetch: Fetch, config?: FetchConfig) => import("..").HttpClient<SharedRoutes>;
export {};
