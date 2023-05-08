import type { UnknownSharedRoute } from "../core/index.mjs";
import { HandlerCreator } from "../core/index.mjs";
import type { SuperTest, Test } from "supertest";
export declare const createSupertestHandlerCreator: (supertestRequest: SuperTest<Test>) => HandlerCreator<any>;
export declare const createSupertestSharedClient: <SharedRoutes extends Record<string, UnknownSharedRoute>>(sharedRoutes: SharedRoutes, supertestRequest: SuperTest<Test>) => import("../core/index.mjs").HttpClient<SharedRoutes>;
