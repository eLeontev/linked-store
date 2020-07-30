import { asyncStatuses, IDerivedStore, GetStateCallback } from '../models';

export const getResolvedResource = <T>(store: IDerivedStore<T>): T => store.getResource();
export const throwResult = <T>(store: IDerivedStore<T>): T => {
    throw store.getResource();
};
export type ResourceHandlers = {
    [status in asyncStatuses]: <T>(store: IDerivedStore<T>) => T;
};
export const resourceHandlers: ResourceHandlers = {
    [asyncStatuses.ready]: getResolvedResource,
    [asyncStatuses.pending]: throwResult,
    [asyncStatuses.error]: throwResult,
};

export const getAsyncResource = <T>(store: IDerivedStore<T>): GetStateCallback<T> => () =>
    resourceHandlers[store.getStatus()](store);
