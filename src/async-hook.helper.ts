import { asyncStatuses, IDerivedStore } from './models';

export const getResolvedResult = <T>(store: IDerivedStore<T>) => store.getResult();
export const throwResult = <T>(store: IDerivedStore<T>) => {
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

export const getAsyncResult = <T>(store: IDerivedStore<T>, status: asyncStatuses) =>
    resultHandlers[status]<T>(store);
