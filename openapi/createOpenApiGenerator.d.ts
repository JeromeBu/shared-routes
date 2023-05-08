import { OpenAPIV3 as OpenAPI } from "openapi-types";
import { UnknownSharedRoute } from "../core";
import { z } from "zod";
type TypedTag<T extends string> = {
    name: T;
};
type CreateOpenApiGenerator = <SharedRoutes extends Record<string, UnknownSharedRoute>, TagName extends string>(sharedRoutes: SharedRoutes, openApiRootDoc: Omit<OpenAPI.Document, "paths"> & {
    tags?: TypedTag<TagName>[];
}) => (extraDataByRoute: Partial<{
    [R in keyof SharedRoutes]: Omit<OpenAPI.PathItemObject, OpenAPI.HttpMethods> & {
        tags?: TagName[];
        extraDocumentation?: {
            body?: OpenAPI.BaseSchemaObject & {
                properties?: Partial<Record<keyof z.infer<SharedRoutes[R]["bodySchema"]>, OpenAPI.BaseSchemaObject>>;
            };
            queryParams?: Partial<Record<keyof z.infer<SharedRoutes[R]["queryParamsSchema"]>, Partial<OpenAPI.ParameterObject>>>;
            headerParams?: Partial<Record<keyof z.infer<SharedRoutes[R]["headersSchema"]>, Partial<OpenAPI.ParameterObject>>>;
            responseBody?: OpenAPI.BaseSchemaObject & {
                properties?: Partial<Record<keyof z.infer<SharedRoutes[R]["queryParamsSchema"]>, OpenAPI.BaseSchemaObject>>;
            };
        };
    };
}>) => OpenAPI.Document;
export declare const createOpenApiGenerator: CreateOpenApiGenerator;
export {};
