// eslint-disable-next-line @typescript-eslint/no-var-requires
const { useEffect, useState } = require('react');

import { getAsyncResult } from './async-hook.helper';

import { IDerivedStore, IStore, SetState } from './models';

export const useLinkedStateValue = <T>(store: IStore<T>): T => {
    const [, setState] = useState({});

    useEffect(() => {
        const trigger = () => setState({});
        store.setTrigger(trigger);

        return (): void => store.removeTrigger(trigger);
    }, [store, setState]);

    let state: T;

    if (store.isAsync()) {
        const derivedStore = store as IDerivedStore<T>;
        state = getAsyncResult(derivedStore, derivedStore.getStatus());
    } else {
        state = store.getState();
    }

    return state;
};

export const useSetLinkedState = <T>(state: IStore<T>): SetState<T> => state.setState;
export const useResetLinkedState = <T>(state: IStore<T>): (() => void) => state.resetState;

export const useLinkedState = <T>(state: IStore<T>): [T, (state: T) => void] => {
    const value = useLinkedStateValue(state);
    const setter = useSetLinkedState(state);

    return [value, setter];
};
