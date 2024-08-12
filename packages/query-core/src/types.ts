export type OmitKeyof<
  TObject,
  TKey extends TStrictly extends 'safely'
    ?
        | keyof TObject
        | (string & Record<never, never>)
        | (number & Record<never, never>)
        | (symbol & Record<never, never>)
    : keyof TObject,
  TStrictly extends 'strictly' | 'safely' = 'strictly',
> = Omit<TObject, TKey>

export interface InfiniteData<TData, TPageParam = unknown> {
  pages: Array<TData>
  pageParams: Array<TPageParam>
}

export type GetPreviousPageParamFunction<TPageParam, TQueryFnData = unknown> = (
  firstPage: TQueryFnData,
  allPages: Array<TQueryFnData>,
  firstPageParam: TPageParam,
  allPageParams: Array<TPageParam>,
) => TPageParam | undefined | null

export type GetNextPageParamFunction<TPageParam, TQueryFnData = unknown> = (
  lastPage: TQueryFnData,
  allPages: Array<TQueryFnData>,
  lastPageParam: TPageParam,
  allPageParams: Array<TPageParam>,
) => TPageParam | undefined | null

export interface InitialPageParam<TPageParam = unknown> {
  initialPageParam: TPageParam
}

export interface InfiniteQueryPageParamsOptions<
  TQueryFnData = unknown,
  TPageParam = unknown,
> extends InitialPageParam<TPageParam> {
  /**
   * This function can be set to automatically get the previous cursor for infinite queries.
   * The result will also be used to determine the value of `hasPreviousPage`.
   */
  getPreviousPageParam?: GetPreviousPageParamFunction<TPageParam, TQueryFnData>
  /**
   * This function can be set to automatically get the next cursor for infinite queries.
   * The result will also be used to determine the value of `hasNextPage`.
   */
  getNextPageParam: GetNextPageParamFunction<TPageParam, TQueryFnData>
}

export type FetchDirection = 'forward' | 'backward'

export interface FetchMeta {
  fetchMore?: { direction: FetchDirection }
}

export type QueryKey = ReadonlyArray<unknown>

export interface Register {}

export type QueryMeta = Register extends {
  queryMeta: infer TQueryMeta
}
  ? TQueryMeta extends Record<string, unknown>
    ? TQueryMeta
    : Record<string, unknown>
  : Record<string, unknown>

export type QueryFunctionContext<
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = never,
> = [TPageParam] extends [never]
  ? {
      queryKey: TQueryKey
      signal: AbortSignal
      meta: QueryMeta | undefined
      pageParam?: unknown
      /**
       * @deprecated
       * if you want access to the direction, you can add it to the pageParam
       */
      direction?: unknown
    }
  : {
      queryKey: TQueryKey
      signal: AbortSignal
      pageParam: TPageParam
      /**
       * @deprecated
       * if you want access to the direction, you can add it to the pageParam
       */
      direction: FetchDirection
      meta: QueryMeta | undefined
    }

export interface CancelOptions {
  revert?: boolean
  silent?: boolean
}

export type DefaultError = Register extends {
  defaultError: infer TError
}
  ? TError
  : Error

export type NetworkMode = 'online' | 'always' | 'offlineFirst'
