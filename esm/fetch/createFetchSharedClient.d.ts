import type { UnknownSharedRoute, Url } from "../index.mjs";
import { HandlerCreator } from "../index.mjs";
type Fetch = (url: URL | RequestInfo, init?: RequestInit) => Promise<Response>;
type FetchConfig = {
    baseURL?: Url;
};
export declare const createFetchHandlerCreator: <SharedRoutes extends Record<string, UnknownSharedRoute>>(fetch: Fetch, { baseURL }?: FetchConfig) => HandlerCreator<SharedRoutes>;
export declare const createFetchSharedClient: <SharedRoutes extends Record<string, UnknownSharedRoute>>(sharedRouters: SharedRoutes, fetch: Fetch, config?: FetchConfig) => import("../index.mjs").HttpClient<SharedRoutes>;
export {};
