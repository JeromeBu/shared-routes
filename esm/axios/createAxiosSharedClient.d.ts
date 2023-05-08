import type { AxiosInstance } from "axios";
import type { UnknownSharedRoute } from "../core/index.mjs";
import { HandlerCreator } from "../core/index.mjs";
export declare const createAxiosHandlerCreator: <SharedRoutes extends Record<string, UnknownSharedRoute>>(axios: AxiosInstance) => HandlerCreator<SharedRoutes>;
export declare const createAxiosSharedClient: <SharedRoutes extends Record<string, UnknownSharedRoute>>(sharedRouters: SharedRoutes, axios: AxiosInstance) => import("../core/index.mjs").HttpClient<SharedRoutes>;
