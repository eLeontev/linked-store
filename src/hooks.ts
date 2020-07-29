import { useRegisterTrigger } from './utils/use-register-trigger.hook';
import { getAsyncResult } from './utils/async-hook.helper';

import { IDerivedStore, IStore, SetState, LinkedStoreState } from './models';

export const useLinkedStoreValue = <T>(store: IStore<T>): LinkedStoreState<T> => {
    useRegisterTrigger(store);

    const state = store.getState();
    const getState = store.isAsync() ? getAsyncResult(store as IDerivedStore<T>) : () => state;

    return {
        state,
        getState,
    };
};

export const useAsyncLinkedValue = <T>(store: IDerivedStore<T>): T => {
    useRegisterTrigger(store);

    return getAsyncResult(store)();
};

export const useSetLinkedStore = <T>(store: IStore<T>): SetState<T> => store.setState;
export const useResetLinkedStore = <T>(store: IStore<T>): (() => void) => store.resetState;

export const useLinkedStore = <T>(store: IStore<T>): [LinkedStoreState<T>, SetState<T>] => [
    useLinkedStoreValue(store),
    useSetLinkedStore(store),
];

export const useAsyncLinkedStore = <T>(store: IDerivedStore<T>): [T, SetState<T>] => [
    useAsyncLinkedValue(store),
    useSetLinkedStore(store),
];
