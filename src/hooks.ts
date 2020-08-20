import { useRegisterTrigger } from './utils/use-register-trigger.hook';
import { getAsyncResource } from './utils/async-hook.helper';

import {
    asyncStatuses,
    AsyncWithLoaderResult,
    GetStateHookCallback,
    IDerivedStore,
    IStore,
    Resource,
    SetState,
    State,
} from './models';

export const useLinkedStoreValue = <T>(store: IStore<T>): [State<T>, GetStateHookCallback<T>] => {
    useRegisterTrigger(store);

    const state = store.getState();
    const getState = store.isAsync()
        ? getAsyncResource(store as IDerivedStore<T>)
        : () => store.getState() as any; // eslint-disable-line @typescript-eslint/no-explicit-any

    return [state, getState];
};

export const useAsyncLinkedStoreValue = <T>(store: IDerivedStore<T>): Resource<T> => {
    useRegisterTrigger(store);
    return getAsyncResource(store)();
};

export const useSetLinkedStore = <T>(store: IStore<T>): SetState<T> => store.setState;
export const useResetLinkedStore = <T>(store: IStore<T>): (() => void) => store.resetState;

export const useLinkedStore = <T>(
    store: IStore<T>
): [State<T>, SetState<T>, GetStateHookCallback<T>] => {
    const [state, getState] = useLinkedStoreValue(store);
    return [state, useSetLinkedStore(store), getState];
};

export const useAsyncLinkedStore = <T>(store: IDerivedStore<T>): [Resource<T>, SetState<T>] => [
    useAsyncLinkedStoreValue(store),
    useSetLinkedStore(store),
];

export const useAsyncWithLoaderLinkedStore = <T, E = string>(
    store: IDerivedStore<T>
): AsyncWithLoaderResult<T, E> => {
    useRegisterTrigger(store);
    const status = store.getStatus();

    const isError = status === asyncStatuses.error;
    const isLoading = status === asyncStatuses.pending;

    return {
        isLoading,
        error: isError ? ((store.getResource() as unknown) as E) : null,
        data: store.getResource(),
    };
};
