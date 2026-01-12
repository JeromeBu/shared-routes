import type { IRoute, RequestHandler, Router } from "express";
import type { PathParameters, UnknownSharedRoute } from "..";
import { keys } from "..";
import { ValueOfIndexNumber } from "../defineRoutes";
import { StandardSchemaV1 } from "../standardSchemaUtils";
import { HttpClientOptions, validateInputParams } from "../validations";

export type ExpressSharedRouterOptions = {
  onInputValidationError?: (
    validationResult: StandardSchemaV1.FailureResult,
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
      const schemaError = error as StandardSchemaV1.FailureResult;
      res.status(400);

      if (options?.onInputValidationError) {
        const processedError = options.onInputValidationError(schemaError, route);
        if (processedError !== schemaError) {
          res.json(JSON.stringify(processedError, null, 2));
          return;
        }
      }

      res.json({
        status: 400,
        message: error.message,
        issues: Array.from(new Set(zodIssuesToStrings(schemaError?.issues))),
      });
    }
  };

const formatPath = (
  path: StandardSchemaV1.Issue["path"] | undefined,
  fallback = "",
): string => path?.join(".") || fallback;

const formatIssueString = (path: string, message: string): string =>
  `${path} : ${message}`;

const hasErrorCode = (issue: StandardSchemaV1.Issue, code: string): boolean =>
  "code" in issue && issue.code === code;

const zodIssuesToStrings = (
  issues: ReadonlyArray<StandardSchemaV1.Issue> = [],
): string[] =>
  issues.flatMap((issue): string | string[] => {
    const issueData = issue as any;

    if (hasErrorCode(issue, "invalid_union")) {
      const nestedErrors = issueData.errors ?? [];
      if (nestedErrors.length > 0) {
        return nestedErrors.flatMap((nestedIssues: any) =>
          zodIssuesToStrings(nestedIssues),
        );
      }

      const path = formatPath(issue.path, issueData.discriminator);
      const messageParts = [
        issue.message,
        issueData.note,
        issueData.discriminator && `discriminator: ${issueData.discriminator}`,
      ].filter(Boolean);
      return formatIssueString(path, messageParts.join(" - "));
    }

    if (hasErrorCode(issue, "invalid_union_discriminator")) {
      return formatIssueString(formatPath(issue.path, "discriminator"), issue.message);
    }

    if (Array.isArray(issueData.unionErrors)) {
      return issueData.unionErrors.flatMap((unionError: any) =>
        zodIssuesToStrings(unionError?.issues ?? []),
      );
    }

    return formatIssueString(formatPath(issue.path), issue.message);
  });

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
        StandardSchemaV1.InferOutput<
          ValueOfIndexNumber<SharedRoutes[Route]["responses"]>
        >,
        StandardSchemaV1.InferOutput<SharedRoutes[Route]["requestBodySchema"]>,
        StandardSchemaV1.InferOutput<
          SharedRoutes[Route]["queryParamsSchema"]
        > extends void
          ? ParsedQs
          : StandardSchemaV1.InferOutput<SharedRoutes[Route]["queryParamsSchema"]>,
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
