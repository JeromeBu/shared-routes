type RawQueryParams = {
    [key: string]: string | boolean | number;
};
export type QueryParams<T extends RawQueryParams> = {
    [K in keyof T]: T[K];
};
export declare const convertToFormData: <T extends QueryParams<RawQueryParams>>(params: T) => string;
export {};
