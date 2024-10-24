import type { HandlerParams } from "./configureCreateHttpClient";
import type { UnknownSharedRoute } from "./defineRoutes";
export type ValidationOptions = {
    skipInputValidation?: boolean;
    skipResponseValidation?: boolean;
    skipResponseValidationForStatuses?: number[];
};
type ExtractFromExisting<T, U extends T> = Extract<T, U>;
type CheckedSchema = ExtractFromExisting<keyof UnknownSharedRoute, "queryParamsSchema" | "requestBodySchema" | "headersSchema" | "responses">;
export declare const validateSchemaWithExplicitError: <R extends UnknownSharedRoute>({ checkedSchema, params, route, adapterName, responseStatus, withIssuesInMessage, }: {
    checkedSchema: ExtractFromExisting<keyof UnknownSharedRoute, "queryParamsSchema" | "requestBodySchema" | "headersSchema" | "responses">;
    params: unknown;
    route: R;
    adapterName: string;
    responseStatus?: CheckedSchema extends "responses" ? keyof R["responses"] : never;
    withIssuesInMessage?: boolean;
}) => unknown;
export declare const validateInputParams: (route: UnknownSharedRoute, params: HandlerParams<UnknownSharedRoute>, adapterName: string, options?: {
    withIssuesInMessage: boolean;
}) => {
    queryParams: unknown;
    body: unknown;
    headers: unknown;
};
export {};
