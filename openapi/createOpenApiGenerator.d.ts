import { OpenAPIV3 as OpenAPI } from "openapi-types";
import { UnknownSharedRoute } from "..";
import { z } from "zod";
type CreateOpenApiGenerator = <SharedRoutesByTag extends {
    [T: string]: Record<string, UnknownSharedRoute>;
}>(sharedRoutesByTag: SharedRoutesByTag, openApiRootDoc: Omit<OpenAPI.Document, "paths">) => (extraDataByRoute: Partial<{
    [Tag in keyof SharedRoutesByTag]: {
        [R in keyof SharedRoutesByTag[Tag]]: Omit<OpenAPI.PathItemObject, OpenAPI.HttpMethods> & {
            extraDocs: {
                body?: OpenAPI.BaseSchemaObject & {
                    properties?: Partial<Record<keyof z.infer<SharedRoutesByTag[Tag][R]["requestBodySchema"]>, OpenAPI.BaseSchemaObject>>;
                };
                queryParams?: Partial<Record<keyof z.infer<SharedRoutesByTag[Tag][R]["queryParamsSchema"]>, Partial<OpenAPI.ParameterObject>>>;
                headerParams?: Partial<Record<keyof z.infer<SharedRoutesByTag[Tag][R]["headersSchema"]>, Partial<OpenAPI.ParameterObject>>>;
                responses: {
                    [S in keyof SharedRoutesByTag[Tag][R]["responses"]]: OpenAPI.ResponseObject;
                };
            };
        };
    };
}>) => OpenAPI.Document;
export declare const createOpenApiGenerator: CreateOpenApiGenerator;
export {};
