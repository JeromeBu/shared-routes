import type { UnknownSharedRoute } from "../core";
import { HandlerCreator } from "../core";
import type { SuperTest, Test } from "supertest";
export declare const createSupertestHandlerCreator: (supertestRequest: SuperTest<Test>) => HandlerCreator<any>;
export declare const createSupertestSharedClient: <SharedRoutes extends Record<string, UnknownSharedRoute>>(sharedRoutes: SharedRoutes, supertestRequest: SuperTest<Test>) => import("../core").HttpClient<SharedRoutes>;
