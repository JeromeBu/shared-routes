import { Handler, HttpClient } from "./configureCreateHttpClient.mjs";
import { UnknownSharedRoute } from "./defineRoutes.mjs";
export declare const createCustomSharedClient: <SharedRoutes extends Record<string, UnknownSharedRoute>>(sharedRoutes: SharedRoutes, customHandlers: { [K in keyof SharedRoutes]: Handler<SharedRoutes[K]>; }) => HttpClient<SharedRoutes>;
