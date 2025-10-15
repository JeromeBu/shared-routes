import type { SuperTest, Test } from "supertest";
import type { UnknownSharedRoute } from "../index.mjs";
import { HandlerCreator } from "../index.mjs";
export declare const createSupertestHandlerCreator: (supertestRequest: SuperTest<Test>) => HandlerCreator<any>;
export declare const createSupertestSharedClient: <SharedRoutes extends Record<string, UnknownSharedRoute>>(sharedRoutes: SharedRoutes, supertestRequest: SuperTest<Test>) => import("../index.mjs").HttpClient<SharedRoutes>;
