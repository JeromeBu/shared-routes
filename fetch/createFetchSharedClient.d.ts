import type { UnknownSharedRoute, Url } from "..";
import { HandlerCreator } from "..";
import type nodeFetch from "node-fetch";
declare function browserFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
type Fetch = typeof browserFetch | typeof nodeFetch;
type FetchConfig = {
    baseURL?: Url;
};
export declare const createFetchHandlerCreator: <SharedRoutes extends Record<string, UnknownSharedRoute>>(fetch: Fetch, { baseURL }?: FetchConfig) => HandlerCreator<SharedRoutes>;
export declare const createFetchSharedClient: <SharedRoutes extends Record<string, UnknownSharedRoute>>(sharedRouters: SharedRoutes, fetch: Fetch, config?: FetchConfig) => import("..").HttpClient<SharedRoutes>;
export {};
