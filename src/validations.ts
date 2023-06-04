import { HandlerParams } from "./configureCreateHttpClient";
import { UnknownSharedRoute } from "./defineRoutes";

type ExtractFromExisting<T, U extends T> = Extract<T, U>;
type CheckedSchema = ExtractFromExisting<
  keyof UnknownSharedRoute,
  "queryParamsSchema" | "requestBodySchema" | "headersSchema" | "responseBodySchema"
>;

const explicitError = ({
  route,
  error,
  adapterName,
  checkedSchema,
}: {
  route: UnknownSharedRoute;
  error: unknown;
  adapterName: string;
  checkedSchema: CheckedSchema;
}): Error => {
  const newError = new Error(
    [
      checkedSchema,
      "was not respected for route",
      route.method.toUpperCase(),
      route.url,
      "in shared-routes",
      adapterName,
      "adapter",
    ].join(" "),
  );
  (newError as any).cause = error;
  return newError;
};

export const validateSchemaWithExplictError = ({
  checkedSchema,
  params = {},
  route,
  adapterName,
}: {
  checkedSchema: ExtractFromExisting<
    keyof UnknownSharedRoute,
    "queryParamsSchema" | "requestBodySchema" | "headersSchema" | "responseBodySchema"
  >;
  params: unknown;
  route: UnknownSharedRoute;
  adapterName: string;
}) => {
  try {
    return route[checkedSchema].parse(params);
  } catch (error) {
    throw explicitError({ route, error, adapterName, checkedSchema });
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

  const headers = validateSchemaWithExplictError({
    adapterName,
    checkedSchema: "headersSchema",
    params: params.headers,
    route,
  });

  const body = validateSchemaWithExplictError({
    adapterName,
    checkedSchema: "requestBodySchema",
    params: params.body,
    route,
  });

  return { queryParams, headers, body };
};
