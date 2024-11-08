import type { IRoute, RequestHandler, Router } from "express";
import type { PathParameters, UnknownSharedRoute } from "..";
import { keys } from "..";
import { z, ZodError, ZodIssue } from "zod";
import { HttpClientOptions, validateInputParams } from "../validations";
import { ValueOfIndexNumber } from "../defineRoutes";

export type ExpressSharedRouterOptions = {
  onInputValidationError?: (
    validationResult: ZodError,
    route: UnknownSharedRoute,
  ) => unknown;
} & Pick<HttpClientOptions, "skipInputValidation">;

const makeValidationMiddleware =
  (route: UnknownSharedRoute, options: ExpressSharedRouterOptions): RequestHandler =>
  (req, res, next) => {
    try {
      if (!options.skipInputValidation) {
        const validatedParams = validateInputParams(
          route,
          { body: req.body, headers: req.headers, queryParams: req.query },
          "express",
        );
        req.body = validatedParams.body;
        req.query = validatedParams.queryParams as any;
        req.headers = validatedParams.headers as any;
      }
      next();
    } catch (error: any) {
      const zodError = error.cause as ZodError;
      res.status(400);

      if (options?.onInputValidationError) {
        const processedError = options.onInputValidationError(zodError, route);
        if (processedError !== zodError) {
          res.json(JSON.stringify(processedError, null, 2));
          return;
        }
      }

      res.json({
        status: 400,
        message: error.message,
        issues: Array.from(new Set(zodIssuesToStrings(zodError.issues))),
      });
    }
  };

const zodIssuesToStrings = (zodIssues: ZodIssue[]): string[] => {
  return zodIssues.flatMap((zodIssue) => {
    if (zodIssue.code === "invalid_union") {
      return zodIssue.unionErrors.flatMap(({ issues }) => zodIssuesToStrings(issues));
    }

    const { message, path } = zodIssue;
    return `${path.join(".")} : ${message}`;
  });
};

const assignHandlersToExpressRouter = (
  expressRouter: Router,
  route: UnknownSharedRoute,
  options: ExpressSharedRouterOptions = {},
): ((...handlers: RequestHandler[]) => IRoute) => {
  const validationMiddleware = makeValidationMiddleware(route, options);
  const url = route.url as string;

  return (...handlers: RequestHandler[]) =>
    expressRouter.route(url)[route.method](validationMiddleware, handlers);
};

// this should be imported from express, but I couldn't find it. It comes from 'qs' package
interface ParsedQs {
  [key: string]: undefined | string | string[] | ParsedQs | ParsedQs[];
}

export const createExpressSharedRouter = <
  SharedRoutes extends Record<string, UnknownSharedRoute>,
  ExpressSharedRouter extends {
    [Route in keyof SharedRoutes & string]: (
      ...handlers: RequestHandler<
        PathParameters<SharedRoutes[Route]["url"]>,
        z.infer<ValueOfIndexNumber<SharedRoutes[Route]["responses"]>>,
        z.infer<SharedRoutes[Route]["requestBodySchema"]>,
        z.infer<SharedRoutes[Route]["queryParamsSchema"]> extends void
          ? ParsedQs
          : z.infer<SharedRoutes[Route]["queryParamsSchema"]>,
        any
      >[]
    ) => IRoute;
  },
>(
  sharedRoutes: SharedRoutes,
  expressRouter: Router,
  options?: ExpressSharedRouterOptions,
): ExpressSharedRouter => {
  const expressSharedRouter = keys(sharedRoutes).reduce((acc, routeName) => {
    const route = sharedRoutes[routeName];
    return {
      ...acc,
      [routeName]: assignHandlersToExpressRouter(expressRouter, route, options),
    };
  }, {} as ExpressSharedRouter);

  return expressSharedRouter;
};
