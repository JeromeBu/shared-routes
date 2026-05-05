import type { AxiosInstance } from "axios";
import type { UnknownSharedRoute } from "../index.mjs";
import { HandlerCreator } from "../index.mjs";
import { HttpClientOptions } from "../validations.mjs";
export declare const createAxiosHandlerCreator: <SharedRoutes extends Record<string, UnknownSharedRoute>>(axios: AxiosInstance, options?: HttpClientOptions) => HandlerCreator<SharedRoutes>;
export declare const createAxiosSharedClient: <SharedRoutes extends Record<string, UnknownSharedRoute>>(sharedRouters: SharedRoutes, axios: AxiosInstance, validationOptions?: HttpClientOptions) => import("../index.mjs").HttpClient<SharedRoutes>;
