import type { IRoute, RequestHandler, Router } from "express";
import type { PathParameters, UnknownSharedRoute } from "..";
import { StandardSchemaV1 } from "../standardSchemaUtils";
import { HttpClientOptions } from "../validations";
import { ValueOfIndexNumber } from "../defineRoutes";
export type ExpressSharedRouterOptions = {
    onInputValidationError?: (validationResult: StandardSchemaV1.FailureResult, route: UnknownSharedRoute) => unknown;
} & Pick<HttpClientOptions, "skipInputValidation">;
interface ParsedQs {
    [key: string]: undefined | string | string[] | ParsedQs | ParsedQs[];
}
export declare const createExpressSharedRouter: <SharedRoutes extends Record<string, UnknownSharedRoute>, ExpressSharedRouter extends { [Route in keyof SharedRoutes & string]: (...handlers: RequestHandler<PathParameters<SharedRoutes[Route]["url"]>, StandardSchemaV1.Infer<ValueOfIndexNumber<SharedRoutes[Route]["responses"]>>, StandardSchemaV1.Infer<SharedRoutes[Route]["requestBodySchema"]>, StandardSchemaV1.Infer<SharedRoutes[Route]["queryParamsSchema"]> extends void ? ParsedQs : StandardSchemaV1.Infer<SharedRoutes[Route]["queryParamsSchema"]>, any>[]) => IRoute; }>(sharedRoutes: SharedRoutes, expressRouter: Router, options?: ExpressSharedRouterOptions) => ExpressSharedRouter;
export {};
