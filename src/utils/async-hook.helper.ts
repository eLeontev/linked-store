import { asyncStatuses, IDerivedStore, Resource, ResourceHandler } from '../models';
import { GetStateCallback } from '../../types';

export const getResolvedResource = <T>(store: IDerivedStore<T>): Resource<T> => store.getResource();
export const throwResult = <T>(store: IDerivedStore<T>): Resource<T> => {
    throw store.getResource();
};
export type ResourceHandlers = {
    [status in asyncStatuses]: ResourceHandler;
};
export const resourceHandlers: ResourceHandlers = {
    [asyncStatuses.ready]: getResolvedResource,
    [asyncStatuses.pending]: throwResult,
    [asyncStatuses.error]: throwResult,
};

export const getAsyncResource = <T>(store: IDerivedStore<T>): GetStateCallback<Resource<T>> => () =>
    resourceHandlers[store.getStatus()](store);
