type RawQueryParams = { [key: string]: string | boolean | number };

export type QueryParams<T extends RawQueryParams> = {
  [K in keyof T]: T[K];
};

export const queryParamsToString = <Q extends QueryParams<RawQueryParams>>(
  queryParams: Q,
): string =>
  (Object.keys(queryParams) as Array<keyof Q>)
    .reduce(
      (acc: string[], param) => [
        ...acc,
        ...(typeof queryParams[param] !== "undefined"
          ? [`${param.toString()}=${encodeURI(queryParams[param].toString())}`]
          : []),
      ],
      [],
    )
    .join("&");
