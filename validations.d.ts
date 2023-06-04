import { HandlerParams } from "./configureCreateHttpClient";
import { UnknownSharedRoute } from "./defineRoutes";
export type ValidationOptions = {
    skipInputValidation?: boolean;
    skipResponseValidation?: boolean;
};
type ExtractFromExisting<T, U extends T> = Extract<T, U>;
export declare const validateSchemaWithExplictError: ({ checkedSchema, params, route, adapterName, }: {
    checkedSchema: ExtractFromExisting<keyof UnknownSharedRoute, "queryParamsSchema" | "requestBodySchema" | "headersSchema" | "responseBodySchema">;
    params: unknown;
    route: UnknownSharedRoute;
    adapterName: string;
}) => unknown;
export declare const validateInputParams: (route: UnknownSharedRoute, params: HandlerParams<UnknownSharedRoute>, adapterName: string) => {
    queryParams: unknown;
    body: unknown;
    headers: unknown;
};
export {};
