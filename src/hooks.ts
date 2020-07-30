import { useRegisterTrigger } from './utils/use-register-trigger.hook';
import { getAsyncResource } from './utils/async-hook.helper';

import { IDerivedStore, IStore, SetState, LinkedStoreState, GetStateCallback } from './models';

export const useLinkedStoreValue = <T>(store: IStore<T>): LinkedStoreState<T> => {
    useRegisterTrigger(store);

    const state = store.getState();
    const getState = store.isAsync() ? getAsyncResource(store as IDerivedStore<T>) : () => state;

    return [state as T, getState as GetStateCallback<T>];
};

export const useAsyncLinkedStoreValue = <T>(store: IDerivedStore<T>): T => {
    useRegisterTrigger(store);

    return getAsyncResource(store)();
};

export const useSetLinkedStore = <T>(store: IStore<T>): SetState<T> => store.setState;
export const useResetLinkedStore = <T>(store: IStore<T>): (() => void) => store.resetState;

export const useLinkedStore = <T>(store: IStore<T>): [T, SetState<T>, GetStateCallback<T>] => {
    const [state, getState] = useLinkedStoreValue(store);

    return [state, useSetLinkedStore(store), getState];
};

export const useAsyncLinkedStore = <T>(store: IDerivedStore<T>): [T, SetState<T>] => [
    useAsyncLinkedStoreValue(store),
    useSetLinkedStore(store),
];
