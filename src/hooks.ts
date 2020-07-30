import { useRegisterTrigger } from './utils/use-register-trigger.hook';
import { getAsyncResource } from './utils/async-hook.helper';

import { IDerivedStore, IStore, SetState, GetStateCallback } from './models';

export const useLinkedStoreValue = <T, R = T>(store: IStore<T, R>): [T, GetStateCallback<R>] => {
    useRegisterTrigger(store);

    const state = store.getState();
    const getState = store.isAsync()
        ? getAsyncResource(store as IDerivedStore<T, R>)
        : () => (store.getState() as unknown) as R;

    return [state, getState];
};

export const useAsyncLinkedStoreValue = <T, R = T>(store: IDerivedStore<T, R>): R => {
    useRegisterTrigger(store);

    return getAsyncResource(store)();
};

export const useSetLinkedStore = <T, R = T>(store: IStore<T, R>): SetState<T> => store.setState;
export const useResetLinkedStore = <T, R = T>(store: IStore<T, R>): (() => void) =>
    store.resetState;

export const useLinkedStore = <T, R = T>(
    store: IStore<T, R>
): [T, SetState<T>, GetStateCallback<R>] => {
    const [state, getState] = useLinkedStoreValue(store);

    return [state, useSetLinkedStore(store), getState];
};

export const useAsyncLinkedStore = <T, R = T>(store: IDerivedStore<T, R>): [R, SetState<T>] => [
    useAsyncLinkedStoreValue(store),
    useSetLinkedStore(store),
];
