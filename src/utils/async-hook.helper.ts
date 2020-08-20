import { asyncStatuses, IDerivedStore, Resource, ResourceHandler } from '../models';
import { GetStateCallback } from '../../types';

export const getResolvedResource = <T>(store: IDerivedStore<T>): Resource<T> => store.getResource();
export const throwPendingState = <T>(store: IDerivedStore<T>): never => {
    throw store.getState();
};
export const throwError = <T>(store: IDerivedStore<T>): never => {
    throw store.getResource();
};

export type ResourceHandlers = {
    [status in asyncStatuses]: ResourceHandler;
};
export const resourceHandlers: ResourceHandlers = {
    [asyncStatuses.ready]: getResolvedResource,
    [asyncStatuses.pending]: throwPendingState,
    [asyncStatuses.error]: throwError,
};

export const getAsyncResource = <T>(store: IDerivedStore<T>): GetStateCallback<Resource<T>> => () =>
    resourceHandlers[store.getStatus()](store);
