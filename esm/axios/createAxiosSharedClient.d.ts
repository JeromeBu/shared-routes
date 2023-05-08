import type { AxiosInstance } from "axios";
import type { UnknownSharedRoute } from "../index.mjs";
import { HandlerCreator } from "../index.mjs";
export declare const createAxiosHandlerCreator: <SharedRoutes extends Record<string, UnknownSharedRoute>>(axios: AxiosInstance) => HandlerCreator<SharedRoutes>;
export declare const createAxiosSharedClient: <SharedRoutes extends Record<string, UnknownSharedRoute>>(sharedRouters: SharedRoutes, axios: AxiosInstance) => import("../index.mjs").HttpClient<SharedRoutes>;
