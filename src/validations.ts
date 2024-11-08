import type { ZodIssue } from "zod";
import type { HandlerParams, HttpResponse } from "./configureCreateHttpClient";
import type { UnknownSharedRoute } from "./defineRoutes";

export type HttpClientOptions = {
  /* if true, will not validate request body, query params nor headers */
  skipInputValidation?: boolean;
  /* if true, will not validate response body */
  skipResponseValidation?: boolean;
  /* list of response status codes for which validation will be skipped */
  skipResponseValidationForStatuses?: number[];
  /* callback called on each response, useful for logging or debugging, this is called before response validation */
  onResponseSideEffect?: (response: HttpResponse<any, any>) => void;
};

type ExtractFromExisting<T, U extends T> = Extract<T, U>;
type CheckedSchema = ExtractFromExisting<
  keyof UnknownSharedRoute,
  "queryParamsSchema" | "requestBodySchema" | "headersSchema" | "responses"
>;

const explicitError = ({
  route,
  error,
  adapterName,
  checkedSchema,
  statusCode,
  withIssuesInMessage,
}: {
  route: UnknownSharedRoute;
  error: unknown;
  adapterName: string;
  checkedSchema: CheckedSchema;
  withIssuesInMessage: boolean;
  statusCode?: number;
}): Error => {
  const newError = new Error(
    [
      `Shared-route schema '${checkedSchema}' was not respected in adapter '${adapterName}'.`,
      checkedSchema === "responses" &&
        `Received status: ${statusCode}. Handled statuses: ${Object.keys(
          route.responses,
        ).join(", ")}.`,
      `Route: ${route.method.toUpperCase()} ${route.url}`,
      ...(withIssuesInMessage && (error as any)?.issues?.length
        ? ["Issues: " + issuesToString((error as any)?.issues)]
        : []),
    ]
      .filter(Boolean)
      .join("\n"),
  );
  (newError as any).cause = error;
  return newError;
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
  try {
    if (checkedSchema === "responses") {
      if (!responseStatus)
        throw new Error("a response status is required when validating responses");
      const schema = route[checkedSchema][responseStatus];
      if (!schema) throw new Error("No schema found for this status.");
      return schema.parse(params);
    }
    return route[checkedSchema].parse(params);
  } catch (error) {
    throw explicitError({
      route,
      error,
      adapterName,
      checkedSchema,
      statusCode: responseStatus,
      withIssuesInMessage,
    });
  }
};

export const validateInputParams = (
  route: UnknownSharedRoute,
  params: HandlerParams<UnknownSharedRoute>,
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

const issuesToString = (issues: ZodIssue[]) =>
  issues.map(({ message, path }) => `${path.join(".")}: ${message}`).join(" | ");
