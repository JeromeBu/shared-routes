import type { UnknownSharedRoute, Url } from "../index.mjs";
import { HandlerCreator } from "../index.mjs";
import type nodeFetch from "node-fetch";
import type { Response as FetchResponse } from "node-fetch";
import { ValidationOptions } from "../validations.mjs";
declare function browserFetch(input: RequestInfo | URL, init?: RequestInit): Promise<FetchResponse>;
type Fetch = typeof browserFetch | typeof nodeFetch;
type FetchConfig = RequestInit & {
    baseURL?: Url;
} & ValidationOptions;
export declare const createFetchHandlerCreator: <SharedRoutes extends Record<string, UnknownSharedRoute>>(fetch: Fetch, options?: FetchConfig) => HandlerCreator<SharedRoutes>;
export declare const createFetchSharedClient: <SharedRoutes extends Record<string, UnknownSharedRoute>>(sharedRouters: SharedRoutes, fetch: Fetch, config?: FetchConfig) => import("../index.mjs").HttpClient<SharedRoutes>;
export {};
