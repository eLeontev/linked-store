import { asyncStatuses, IDerivedStore, GetStateCallback } from '../models';

export const getResolvedResult = <T>(store: IDerivedStore<T>): T => store.getResult();
export const throwResult = <T>(store: IDerivedStore<T>): T => {
    throw store.getResult();
};
export type ResultHandlers = {
    [status in asyncStatuses]: <T>(store: IDerivedStore<T>) => T;
};
export const resultHandlers: ResultHandlers = {
    [asyncStatuses.ready]: getResolvedResult,
    [asyncStatuses.pending]: throwResult,
    [asyncStatuses.error]: throwResult,
};

export const getAsyncResult = <T>(store: IDerivedStore<T>): GetStateCallback<T> => () =>
    resultHandlers[store.getStatus()](store);
