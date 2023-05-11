import type { UnknownSharedRoute, Url } from "..";
import { HandlerCreator } from "..";
type Fetch = (url: URL | RequestInfo, init?: RequestInit) => Promise<Response>;
type FetchConfig = {
    baseURL?: Url;
};
export declare const createFetchHandlerCreator: <SharedRoutes extends Record<string, UnknownSharedRoute>>(fetch: Fetch, { baseURL }?: FetchConfig) => HandlerCreator<SharedRoutes>;
export declare const createFetchSharedClient: <SharedRoutes extends Record<string, UnknownSharedRoute>>(sharedRouters: SharedRoutes, fetch: Fetch, config?: FetchConfig) => import("..").HttpClient<SharedRoutes>;
export {};
