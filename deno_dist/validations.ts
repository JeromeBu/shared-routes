import { HandlerParams } from "./configureCreateHttpClient.ts";
import { UnknownSharedRoute } from "./defineRoutes.ts";

export type ValidationOptions = {
  /* if true, will not validate request body, query params nor headers */
  skipInputValidation?: boolean;
  /* if true, will not validate response body */
  skipResponseValidation?: boolean;
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
}: {
  route: UnknownSharedRoute;
  error: unknown;
  adapterName: string;
  checkedSchema: CheckedSchema;
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
    ]
      .filter(Boolean)
      .join("\n"),
  );
  (newError as any).cause = error;
  return newError;
};

export const validateSchemaWithExplictError = <R extends UnknownSharedRoute>({
  checkedSchema,
  params = {},
  route,
  adapterName,
  responseStatus,
}: {
  checkedSchema: ExtractFromExisting<
    keyof UnknownSharedRoute,
    "queryParamsSchema" | "requestBodySchema" | "headersSchema" | "responses"
  >;
  params: unknown;
  route: R;
  adapterName: string;
  responseStatus?: CheckedSchema extends "responses" ? keyof R["responses"] : never;
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
    });
  }
};

export const validateInputParams = (
  route: UnknownSharedRoute,
  params: HandlerParams<UnknownSharedRoute>,
  adapterName: string,
) => {
  const queryParams = validateSchemaWithExplictError({
    adapterName,
    checkedSchema: "queryParamsSchema",
    params: params.queryParams,
    route,
  });

  const body = validateSchemaWithExplictError({
    adapterName,
    checkedSchema: "requestBodySchema",
    params: params.body,
    route,
  });

  // we validate headers separately because we don't want to re-affect req.headers parsed value
  // because we don't want to lose all other headers
  validateSchemaWithExplictError({
    adapterName,
    checkedSchema: "headersSchema",
    params: params.headers,
    route,
  });

  return { queryParams, body, headers: params.headers };
};
