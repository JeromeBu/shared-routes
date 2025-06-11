import type { HandlerParams, HttpResponse } from "./configureCreateHttpClient";
import type { UnknownSharedRoute } from "./defineRoutes";
import { StandardSchemaV1 } from "./standardSchemaUtils";
export type HttpClientOptions = {
    skipInputValidation?: boolean;
    skipResponseValidation?: boolean;
    skipResponseValidationForStatuses?: number[];
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
type CheckedSchema = ExtractFromExisting<keyof UnknownSharedRoute, "queryParamsSchema" | "requestBodySchema" | "headersSchema" | "responses">;
export declare const validateSchemaWithExplicitError: <R extends UnknownSharedRoute>({ checkedSchema, params, route, adapterName, responseStatus, withIssuesInMessage, }: {
    checkedSchema: ExtractFromExisting<keyof UnknownSharedRoute, "queryParamsSchema" | "requestBodySchema" | "headersSchema" | "responses">;
    params: unknown;
    route: R;
    adapterName: string;
    responseStatus?: CheckedSchema extends "responses" ? keyof R["responses"] : never;
    withIssuesInMessage?: boolean;
}) => StandardSchemaV1<unknown, unknown>;
export declare const validateInputParams: (route: UnknownSharedRoute, params: HandlerParams<UnknownSharedRoute>, adapterName: string, options?: {
    withIssuesInMessage: boolean;
}) => {
    queryParams: StandardSchemaV1<unknown, unknown>;
    body: StandardSchemaV1<unknown, unknown>;
    headers: unknown;
};
export {};
