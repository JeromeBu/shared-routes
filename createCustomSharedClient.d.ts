import { Handler, HttpClient } from "./configureCreateHttpClient";
import { UnknownSharedRoute } from "./defineRoutes";
export declare const createCustomSharedClient: <SharedRoutes extends Record<string, UnknownSharedRoute>>(sharedRoutes: SharedRoutes, customHandlers: { [K in keyof SharedRoutes]: Handler<SharedRoutes[K]>; }) => HttpClient<SharedRoutes>;
