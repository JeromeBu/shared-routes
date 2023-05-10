import type { RequestInfo, RequestInit, Response } from "node-fetch";
import type { UnknownSharedRoute } from "../index.mjs";
import { HandlerCreator } from "../index.mjs";
type Fetch = (url: URL | RequestInfo, init?: RequestInit) => Promise<Response>;
export declare const createFetchHandlerCreator: <SharedRoutes extends Record<string, UnknownSharedRoute>>(fetch: Fetch) => HandlerCreator<SharedRoutes>;
export declare const createFetchSharedClient: <SharedRoutes extends Record<string, UnknownSharedRoute>>(sharedRouters: SharedRoutes, fetch: Fetch) => import("../index.mjs").HttpClient<SharedRoutes>;
export {};
