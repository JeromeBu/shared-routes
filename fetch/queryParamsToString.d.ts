type RawQueryParams = {
    [key: string]: string | boolean | number;
};
export type QueryParams<T extends RawQueryParams> = {
    [K in keyof T]: T[K];
};
export declare const queryParamsToString: <Q extends QueryParams<RawQueryParams>>(queryParams: Q) => string;
export {};
