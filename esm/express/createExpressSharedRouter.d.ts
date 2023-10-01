import type { IRoute, RequestHandler, Router } from "express";
import type { PathParameters, UnknownSharedRoute } from "../index.mjs";
import { z } from "zod";
import { ValidationOptions } from "../validations.mjs";
import { ValueOf } from "../defineRoutes.mjs";
type ExpressSharedRouterOptions = Pick<ValidationOptions, "skipInputValidation">;
interface ParsedQs {
    [key: string]: undefined | string | string[] | ParsedQs | ParsedQs[];
}
export declare const createExpressSharedRouter: <SharedRoutes extends Record<string, UnknownSharedRoute>, ExpressSharedRouter extends { [Route in keyof SharedRoutes]: (...handlers: RequestHandler<PathParameters<SharedRoutes[Route]["url"]>, z.TypeOf<ValueOf<SharedRoutes[Route]["responses"]>>, z.TypeOf<SharedRoutes[Route]["requestBodySchema"]>, z.TypeOf<SharedRoutes[Route]["queryParamsSchema"]> extends void ? ParsedQs : z.TypeOf<SharedRoutes[Route]["queryParamsSchema"]>, any>[]) => IRoute; }>(sharedRoutes: SharedRoutes, expressRouter: Router, options?: ExpressSharedRouterOptions) => ExpressSharedRouter;
export {};
