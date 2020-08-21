jest.mock('src/utils/async-hook.helper');
jest.mock('src/utils/use-register-trigger.hook');

import { getAsyncResource } from 'src/utils/async-hook.helper';
import { useRegisterTrigger } from 'src/utils/use-register-trigger.hook';

import { asyncStatuses } from '../src/models';

import {
    useLinkedStoreValue,
    useAsyncLinkedStoreValue,
    useSetLinkedStore,
    useResetLinkedStore,
    useLinkedStore,
    useAsyncLinkedStore,
    useAsyncWithLoaderLinkedStore,
} from 'src/hooks';

let state = 'state';
let resource = 'resource';

let getFormedStore = () => {
    let store: any = {};

    beforeEach(() => {
        store.isAsync = jest.fn().mockName('getState');
        store.getState = jest.fn().mockName('getState').mockReturnValue(state);
        store.settState = jest.fn().mockName('setState');
        store.resetState = jest.fn().mockName('resetState');
        store.getStatus = jest.fn().mockName('getStatus');
        store.getResource = jest.fn().mockName('getResource').mockReturnValue(resource);
    });

    return store;
};
describe('useLinkedStoreValue', () => {
    let store = getFormedStore();

    it('should use custom hook to register trigger for passed store', () => {
        useLinkedStoreValue(store);
        expect(useRegisterTrigger).toHaveBeenCalledWith(store);
    });

    it('should return list of state and state getter returns state', () => {
        store.isAsync.mockReturnValue(false);

        let [stateValue, getState] = useLinkedStoreValue(store);

        expect(store.isAsync).toHaveBeenCalled();
        expect(store.getState).toHaveBeenCalled();

        expect(stateValue).toBe(state);
        expect(getState()).toBe(state);
    });

    it('*async case* should return list of state and state getter with getter returns resource', () => {
        store.isAsync.mockReturnValue(true);

        let [stateValue, getState] = useLinkedStoreValue(store);

        expect(store.isAsync).toHaveBeenCalled();
        expect(store.getState).toHaveBeenCalled();

        expect(stateValue).toBe(state);
        expect(getState()).toBe(resource);
    });
});

describe('useAsyncLinkedStoreValue', () => {
    let store: any = 'store';

    it('should use custom hook to register trigger for passed store', () => {
        useAsyncLinkedStoreValue(store);
        expect(useRegisterTrigger).toHaveBeenCalledWith(store);
    });

    it('should return async resource of passed store', () => {
        expect(useAsyncLinkedStoreValue(store)).toBe(resource);
        expect(getAsyncResource).toHaveBeenCalledWith(store);
    });
});

describe('#useSetLinkedStore', () => {
    let store = getFormedStore();

    it('should return setState of passed store', () => {
        expect(useSetLinkedStore(store)).toBe(store.setState);
    });
});

describe('#useResetLinkedStore', () => {
    let store = getFormedStore();

    it('should return resetState of passed store', () => {
        expect(useResetLinkedStore(store)).toBe(store.resetState);
    });
});

describe('#useLinkedStore', () => {
    let store = getFormedStore();

    it('should return list of: state, setState, getState', () => {
        const [stateValue, setState, getState] = useLinkedStore(store);

        expect(stateValue).toBe(state);
        expect(setState).toBe(store.setState);
        expect(getState()).toBe(state);
    });
});

describe('#useAsyncLinkedStore', () => {
    let store = getFormedStore();

    it('should return list of: state, setState', () => {
        const [stateValue, setState] = useAsyncLinkedStore(store);
        expect(stateValue).toBe(resource);
        expect(setState).toBe(store.setState);
    });
});

describe('#useAsyncWithLoaderLinkedStore', () => {
    let store = getFormedStore();

    it('should return { error, isLoading, data }', () => {
        store.getStatus.mockReturnValue(asyncStatuses.ready);
        const { error, isLoading, data } = useAsyncWithLoaderLinkedStore(store);

        expect(error).toBeNull();
        expect(isLoading).toBeFalsy();
        expect(data).toBe(resource);
    });

    it('should return isLoading if async state is not fulfilled', () => {
        store.getStatus.mockReturnValue(asyncStatuses.pending);
        const { error, isLoading } = useAsyncWithLoaderLinkedStore(store);

        expect(error).toBeNull();
        expect(isLoading).toBeTruthy();
    });

    it('should return error if async state is rejected', () => {
        store.getStatus.mockReturnValue(asyncStatuses.error);
        const { error, isLoading, data } = useAsyncWithLoaderLinkedStore(store);

        expect(error).toBe(resource);
        expect(isLoading).toBeFalsy();
        expect(data).toBeNull();
    });
});
