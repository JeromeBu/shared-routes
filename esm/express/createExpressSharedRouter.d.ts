import type { IRoute, RequestHandler, Router } from "express";
import type { PathParameters, UnknownSharedRoute } from "../index.mjs";
import { ValueOfIndexNumber } from "../defineRoutes.mjs";
import { StandardSchemaV1 } from "../standardSchemaUtils.mjs";
import { HttpClientOptions } from "../validations.mjs";
export type ExpressSharedRouterOptions = {
    onInputValidationError?: (validationResult: StandardSchemaV1.FailureResult, route: UnknownSharedRoute) => unknown;
} & Pick<HttpClientOptions, "skipInputValidation">;
interface ParsedQs {
    [key: string]: undefined | string | string[] | ParsedQs | ParsedQs[];
}
export declare const createExpressSharedRouter: <SharedRoutes extends Record<string, UnknownSharedRoute>, ExpressSharedRouter extends { [Route in keyof SharedRoutes & string]: (...handlers: RequestHandler<PathParameters<SharedRoutes[Route]["url"]>, StandardSchemaV1.InferOutput<ValueOfIndexNumber<SharedRoutes[Route]["responses"]>>, StandardSchemaV1.InferOutput<SharedRoutes[Route]["requestBodySchema"]>, StandardSchemaV1.InferOutput<SharedRoutes[Route]["queryParamsSchema"]> extends void ? ParsedQs : StandardSchemaV1.InferOutput<SharedRoutes[Route]["queryParamsSchema"]>, any>[]) => IRoute; }>(sharedRoutes: SharedRoutes, expressRouter: Router, options?: ExpressSharedRouterOptions) => ExpressSharedRouter;
export {};
