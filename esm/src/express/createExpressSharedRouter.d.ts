import type { IRoute, RequestHandler, Router } from "express";
import type { PathParameters, UnknownSharedRoute } from "../index.mjs";
import { z } from "zod";
import { ValidationOptions } from "../validations.mjs";
import { ValueOfIndexNumber } from "../defineRoutes.mjs";
type ExpressSharedRouterOptions = Pick<ValidationOptions, "skipInputValidation">;
interface ParsedQs {
    [key: string]: undefined | string | string[] | ParsedQs | ParsedQs[];
}
export declare const createExpressSharedRouter: <SharedRoutes extends Record<string, UnknownSharedRoute>, ExpressSharedRouter extends { [Route in keyof SharedRoutes & string]: (...handlers: RequestHandler<PathParameters<SharedRoutes[Route]["url"]>, z.infer<ValueOfIndexNumber<SharedRoutes[Route]["responses"]>>, z.infer<SharedRoutes[Route]["requestBodySchema"]>, z.infer<SharedRoutes[Route]["queryParamsSchema"]> extends void ? ParsedQs : z.infer<SharedRoutes[Route]["queryParamsSchema"]>, any>[]) => IRoute; }>(sharedRoutes: SharedRoutes, expressRouter: Router, options?: ExpressSharedRouterOptions) => ExpressSharedRouter;
export {};