import type { UnknownSharedRoute, Url } from "../index.mjs";
import { HandlerCreator } from "../index.mjs";
import { ValidationOptions } from "../validations.mjs";
type Fetch = typeof fetch;
type FetchConfig = RequestInit & {
    baseURL?: Url;
} & ValidationOptions;
export declare const createFetchHandlerCreator: <SharedRoutes extends Record<string, UnknownSharedRoute>>(fetch: Fetch, options?: FetchConfig) => HandlerCreator<SharedRoutes>;
export declare const createFetchSharedClient: <SharedRoutes extends Record<string, UnknownSharedRoute>>(sharedRouters: SharedRoutes, fetch: Fetch, config?: FetchConfig) => import("../index.mjs").HttpClient<SharedRoutes>;
export {};
