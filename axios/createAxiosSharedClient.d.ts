import type { AxiosInstance } from "axios";
import type { UnknownSharedRoute } from "..";
import { HandlerCreator } from "..";
import { ValidationOptions } from "../validations";
export declare const createAxiosHandlerCreator: <SharedRoutes extends Record<string, UnknownSharedRoute>>(axios: AxiosInstance, options?: ValidationOptions) => HandlerCreator<SharedRoutes>;
export declare const createAxiosSharedClient: <SharedRoutes extends Record<string, UnknownSharedRoute>>(sharedRouters: SharedRoutes, axios: AxiosInstance, validationOptions?: ValidationOptions) => import("..").HttpClient<SharedRoutes>;
