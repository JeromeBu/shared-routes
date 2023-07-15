import { HandlerParams } from "./configureCreateHttpClient";
import { UnknownSharedRoute } from "./defineRoutes";
export type ValidationOptions = {
    skipInputValidation?: boolean;
    skipResponseValidation?: boolean;
};
type ExtractFromExisting<T, U extends T> = Extract<T, U>;
type CheckedSchema = ExtractFromExisting<keyof UnknownSharedRoute, "queryParamsSchema" | "requestBodySchema" | "headersSchema" | "responses">;
export declare const validateSchemaWithExplictError: <R extends UnknownSharedRoute>({ checkedSchema, params, route, adapterName, responseStatus, }: {
    checkedSchema: ExtractFromExisting<keyof UnknownSharedRoute, "queryParamsSchema" | "requestBodySchema" | "headersSchema" | "responses">;
    params: unknown;
    route: R;
    adapterName: string;
    responseStatus?: undefined;
}) => unknown;
export declare const validateInputParams: (route: UnknownSharedRoute, params: HandlerParams<UnknownSharedRoute>, adapterName: string) => {
    queryParams: unknown;
    body: unknown;
    headers: unknown;
};
export {};
