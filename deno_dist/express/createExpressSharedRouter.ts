import type { IRoute, RequestHandler, Router } from "npm:express@4.18.2";
import type { PathParameters, UnknownSharedRoute } from "../core/index.ts";
import { keys } from "../core/index.ts";
import { z, ZodError } from "npm:zod@3.21.4";

type ExpressSharedRouterOptions = {
  skipRequestValidation?: boolean;
};

const makeValidationMiddleware =
  (route: UnknownSharedRoute, options: ExpressSharedRouterOptions): RequestHandler =>
  (req, res, next) => {
    try {
      if (!options.skipRequestValidation) {
        req.body = route.bodySchema.parse(req.body) as any;
        req.query = route.queryParamsSchema.parse(req.query) as any;
        route.headersSchema.parse(req.headers); // we don't want to re-affect req.headers parsed value because we don't want to lose all other headers
      }
      next();
    } catch (e) {
      const error = e as ZodError;
      res.status(400);
      res.json(error.issues.map(({ message, path }) => `${path.join(".")} : ${message}`));
    }
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

export const createExpressSharedRouter = <
  SharedRoutes extends Record<string, UnknownSharedRoute>,
  ExpressSharedRouter extends {
    [Route in keyof SharedRoutes]: (
      ...handlers: RequestHandler<
        PathParameters<SharedRoutes[Route]["url"]>,
        z.infer<SharedRoutes[Route]["responseBodySchema"]>,
        z.infer<SharedRoutes[Route]["bodySchema"]>,
        z.infer<SharedRoutes[Route]["queryParamsSchema"]>,
        any
      >[]
    ) => IRoute;
  },
>(
  sharedRoutes: SharedRoutes,
  expressRouter: Router,
  options?: ExpressSharedRouterOptions,
): {
  expressSharedRouter: ExpressSharedRouter;
} => {
  const expressSharedRouter = keys(sharedRoutes).reduce((acc, routeName) => {
    const route = sharedRoutes[routeName];
    return {
      ...acc,
      [routeName]: assignHandlersToExpressRouter(expressRouter, route, options),
    };
  }, {} as ExpressSharedRouter);

  return {
    expressSharedRouter,
  };
};
