import { OpenAPIV3 as OpenAPI } from "openapi-types";
import { UnknownSharedRoute } from "../index.mjs";
import { z } from "zod";
type CreateOpenApiGenerator = <SharedRoutesByTag extends {
    [T: string]: Record<string, UnknownSharedRoute>;
}>(sharedRoutesByTag: SharedRoutesByTag, openApiRootDoc: Omit<OpenAPI.Document, "paths">) => (extraDataByRoute: Partial<{
    [Tag in keyof SharedRoutesByTag]: Partial<{
        [R in keyof SharedRoutesByTag[Tag]]: Omit<OpenAPI.PathItemObject, OpenAPI.HttpMethods> & {
            extraDocs?: {
                body?: OpenAPI.BaseSchemaObject & {
                    properties?: Partial<Record<keyof z.infer<SharedRoutesByTag[Tag][R]["requestBodySchema"]>, OpenAPI.BaseSchemaObject>>;
                };
                queryParams?: Partial<Record<keyof z.infer<SharedRoutesByTag[Tag][R]["queryParamsSchema"]>, Partial<OpenAPI.ParameterObject>>>;
                headerParams?: Partial<Record<keyof z.infer<SharedRoutesByTag[Tag][R]["headersSchema"]>, Partial<OpenAPI.ParameterObject>>>;
                responseBody?: OpenAPI.BaseSchemaObject & {
                    properties?: Partial<Record<keyof z.infer<SharedRoutesByTag[Tag][R]["queryParamsSchema"]>, OpenAPI.BaseSchemaObject>>;
                };
                successStatusCode?: number;
                responses?: OpenAPI.ResponsesObject;
            };
        };
    }>;
}>) => OpenAPI.Document;
export declare const createOpenApiGenerator: CreateOpenApiGenerator;
export {};
