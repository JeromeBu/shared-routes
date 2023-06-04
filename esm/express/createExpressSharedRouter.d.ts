import type { IRoute, RequestHandler, Router } from "express";
import type { PathParameters, UnknownSharedRoute } from "../index.mjs";
import { z } from "zod";
import { ValidationOptions } from "../validations.mjs";
type ExpressSharedRouterOptions = Pick<ValidationOptions, "skipInputValidation">;
export declare const createExpressSharedRouter: <SharedRoutes extends Record<string, UnknownSharedRoute>, ExpressSharedRouter extends { [Route in keyof SharedRoutes]: (...handlers: RequestHandler<PathParameters<SharedRoutes[Route]["url"]>, z.TypeOf<SharedRoutes[Route]["responseBodySchema"]>, z.TypeOf<SharedRoutes[Route]["requestBodySchema"]>, z.TypeOf<SharedRoutes[Route]["queryParamsSchema"]>, any>[]) => IRoute; }>(sharedRoutes: SharedRoutes, expressRouter: Router, options?: ExpressSharedRouterOptions) => ExpressSharedRouter;
export {};
