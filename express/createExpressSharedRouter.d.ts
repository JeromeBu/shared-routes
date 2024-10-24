import type { IRoute, RequestHandler, Router } from "express";
import type { PathParameters, UnknownSharedRoute } from "..";
import { z, ZodError } from "zod";
import { ValidationOptions } from "../validations";
import { ValueOfIndexNumber } from "../defineRoutes";
export type ExpressSharedRouterOptions = {
    onInputValidationError?: (validationResult: ZodError, route: UnknownSharedRoute) => unknown;
} & Pick<ValidationOptions, "skipInputValidation">;
interface ParsedQs {
    [key: string]: undefined | string | string[] | ParsedQs | ParsedQs[];
}
export declare const createExpressSharedRouter: <SharedRoutes extends Record<string, UnknownSharedRoute>, ExpressSharedRouter extends { [Route in keyof SharedRoutes & string]: (...handlers: RequestHandler<PathParameters<SharedRoutes[Route]["url"]>, z.infer<ValueOfIndexNumber<SharedRoutes[Route]["responses"]>>, z.infer<SharedRoutes[Route]["requestBodySchema"]>, z.infer<SharedRoutes[Route]["queryParamsSchema"]> extends void ? ParsedQs : z.infer<SharedRoutes[Route]["queryParamsSchema"]>, any>[]) => IRoute; }>(sharedRoutes: SharedRoutes, expressRouter: Router, options?: ExpressSharedRouterOptions) => ExpressSharedRouter;
export {};
