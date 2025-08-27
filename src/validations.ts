import type { HandlerOutputParams, HttpResponse } from "./configureCreateHttpClient";
import type { UnknownSharedRoute } from "./defineRoutes";
import { StandardSchemaV1, standardValidate } from "./standardSchemaUtils";

export type HttpClientOptions = {
  /* if true, will not validate request body, query params nor headers */
  skipInputValidation?: boolean;
  /* if true, will not validate response body */
  skipResponseValidation?: boolean;
  /* list of response status codes for which validation will be skipped */
  skipResponseValidationForStatuses?: number[];
  /* callback called on each response, useful for logging or debugging, this is called before response validation */
  onResponseSideEffect?: (params: {
    response: HttpResponse<any, any>;
    route: UnknownSharedRoute;
    durationInMs: number;
    input: {
      body?: unknown;
      queryParams?: unknown;
      urlParams?: unknown;
    };
  }) => void;
};

type ExtractFromExisting<T, U extends T> = Extract<T, U>;
type CheckedSchema = ExtractFromExisting<
  keyof UnknownSharedRoute,
  "queryParamsSchema" | "requestBodySchema" | "headersSchema" | "responses"
>;

const makeExplicitError =
  ({
    route,
    adapterName,
    checkedSchema,
    statusCode,
    withIssuesInMessage,
  }: {
    route: UnknownSharedRoute;
    adapterName: string;
    checkedSchema: CheckedSchema;
    withIssuesInMessage: boolean;
    statusCode?: number;
  }) =>
  ({
    message,
    issues = [],
  }:
    | {
        message: string;
        issues?: ReadonlyArray<StandardSchemaV1.Issue>;
      }
    | {
        issues: ReadonlyArray<StandardSchemaV1.Issue>;
        message?: string;
      }): Error => {
    const error = new Error(
      [
        `Shared-route schema '${checkedSchema}' was not respected in adapter '${adapterName}'.`,
        checkedSchema === "responses" &&
          `Received status: ${statusCode}. Handled statuses: ${Object.keys(
            route.responses,
          ).join(", ")}.`,
        `Route: ${route.method.toUpperCase()} ${route.url}`,
        ...(message ? [`Message: ${message}`] : []),
        ...(withIssuesInMessage && issues.length
          ? ["Issues: " + issuesToString(issues)]
          : []),
      ]
        .filter(Boolean)
        .join("\n"),
    );
    (error as any).issues = issues;
    return error;
  };

export const validateSchemaWithExplicitError = <R extends UnknownSharedRoute>({
  checkedSchema,
  params = {},
  route,
  adapterName,
  responseStatus,
  withIssuesInMessage = false,
}: {
  checkedSchema: ExtractFromExisting<
    keyof UnknownSharedRoute,
    "queryParamsSchema" | "requestBodySchema" | "headersSchema" | "responses"
  >;
  params: unknown;
  route: R;
  adapterName: string;
  responseStatus?: CheckedSchema extends "responses" ? keyof R["responses"] : never;
  withIssuesInMessage?: boolean;
}) => {
  const explicitError = makeExplicitError({
    route,
    adapterName,
    checkedSchema,
    statusCode: responseStatus,
    withIssuesInMessage,
  });

  if (checkedSchema === "responses") {
    if (!responseStatus)
      throw explicitError({
        message: "a response status is required when validating responses",
      });
    const schema = route[checkedSchema][responseStatus];
    if (!schema) throw explicitError({ message: "No schema found for this status." });
    const result = standardValidate(schema, params);
    if (!result.issues) return result.value;
    throw explicitError({
      issues: result.issues,
    });
  }

  const result = standardValidate(route[checkedSchema], params);
  if (!result.issues) return result.value;
  throw explicitError({
    issues: result.issues,
  });
};

export const validateInputParams = (
  route: UnknownSharedRoute,
  params: HandlerOutputParams<UnknownSharedRoute>,
  adapterName: string,
  options: { withIssuesInMessage: boolean } = {
    withIssuesInMessage: false,
  },
) => {
  const { withIssuesInMessage } = options;
  const queryParams = validateSchemaWithExplicitError({
    adapterName,
    checkedSchema: "queryParamsSchema",
    params: params.queryParams,
    route,
    withIssuesInMessage,
  });

  const body = validateSchemaWithExplicitError({
    adapterName,
    checkedSchema: "requestBodySchema",
    params: params.body,
    route,
    withIssuesInMessage,
  });

  // we validate headers separately because we don't want to re-affect req.headers parsed value
  // because we don't want to lose all other headers
  validateSchemaWithExplicitError({
    adapterName,
    checkedSchema: "headersSchema",
    params: params.headers,
    route,
  });

  return { queryParams, body, headers: params.headers };
};

const issuesToString = (issues: ReadonlyArray<StandardSchemaV1.Issue>) =>
  issues
    .map(({ message, path }) => {
      if (path) return `${path.join(".")}: ${message}`;
      return message;
    })
    .join(" | ");
