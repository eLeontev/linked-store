import { asyncStatuses, IDerivedStore, GetStateCallback } from '../models';

export const getResolvedResource = <T, R>(store: IDerivedStore<T, R>): R => store.getResource();
export const throwResult = <T, R>(store: IDerivedStore<T, R>): R => {
    throw store.getResource();
};
export type ResourceHandlers = {
    [status in asyncStatuses]: <T, R>(store: IDerivedStore<T, R>) => R;
};
export const resourceHandlers: ResourceHandlers = {
    [asyncStatuses.ready]: getResolvedResource,
    [asyncStatuses.pending]: throwResult,
    [asyncStatuses.error]: throwResult,
};

export const getAsyncResource = <T, R>(store: IDerivedStore<T, R>): GetStateCallback<R> => () =>
    resourceHandlers[store.getStatus()](store);
