import { simpleStore, derivedStore } from 'src/units/units';
import { BaseStore } from '../../src/units/base-unit';

import { asyncStatuses } from '../../src/models';

let state = 'state';
let updatedState = 'updatedState';
let newState = 'newState';
let resource = 'resource';

describe('simpleStore', () => {
    let store: any;

    beforeEach(() => {
        store = simpleStore(state);
    });

    it('#init state', () => {
        expect(store instanceof BaseStore).toBeTruthy();
        expect(store.state).toBe(state);
        expect(store.defaultState).toBe(state);
    });

    describe('#getState', () => {
        it('should return actual state', () => {
            expect(store.getState()).toBe(state);
        });
    });

    describe('#setState', () => {
        beforeEach(() => {
            store.triggerDependencies = jest.fn().mockName('triggerDependencies');
            store.getUpdatedState = jest
                .fn()
                .mockName('updatedState')
                .mockReturnValue(updatedState);
        });

        it('should throw error is state is not passed', () => {
            let error: any;

            try {
                store.setState();
            } catch (e) {
                error = e;
            }

            expect(error.message).toBe('state should be passed');
        });

        it('should set updated state and trigger dependencies', () => {
            store.setState(newState);

            expect(store.getUpdatedState).toHaveBeenCalledWith(newState);
            expect((store.state = updatedState));
            expect(store.triggerDependencies).toHaveBeenCalled();
        });

        it('should not update state and trigger dependencies is updates state is the same as actual state', () => {
            store.state = updatedState;
            store.setState(newState);

            expect(store.getUpdatedState).toHaveBeenCalledWith(newState);
            expect(store.triggerDependencies).not.toHaveBeenCalled();
        });
    });

    describe('#resetState', () => {
        it('should reset state to default value', () => {
            store.state = updatedState;
            store.resetState();
            expect(store.state).toBe(state);
        });
    });

    describe('#getUpdatedState', () => {
        it('should return state if passed argument is not function', () => {
            expect(store.getUpdatedState(updatedState)).toBe(updatedState);
        });

        it('should call passed callback with actual state and return its result', () => {
            expect(store.getUpdatedState((state: any) => state + updatedState)).toBe(
                state + updatedState
            );
        });
    });
});

describe('derivedStore', () => {
    let store: any;
    let sStore = simpleStore(state);

    beforeEach(() => {
        store = derivedStore((get) => get(sStore));
    });

    it('#init state', () => {
        expect(store instanceof BaseStore).toBeTruthy();
        expect(store.state).toBe(state);
        expect(store.defaultState).toBe(state);

        expect(store.actualState).toBeNull();
        expect(store.resource).toBeNull();
        expect(store.status).toBe(asyncStatuses.ready);
    });

    describe('#getState', () => {
        it('should return actual state', () => {
            expect(store.getState()).toBe(state);
        });
    });

    describe('#setState', () => {
        let getter = 'getter';
        beforeEach(() => {
            store.updateState = jest.fn().mockName('updateState');
            store.getter = jest.fn().mockName('getter').mockReturnValue(getter);
        });

        it('should call update state with getter', () => {
            store.setState();
            expect(store.updateState).toHaveBeenCalledWith(getter);
            expect(store.getter).toHaveBeenCalledWith(store.get);
        });
    });

    describe('#resetState', () => {
        let defaultState = 'defaultState';

        beforeEach(() => {
            store.defaultState = defaultState;
            store.updateState = jest.fn().mockName('updateState');
        });

        it('should call #updateState with default state', () => {
            store.resetState();
            expect(store.updateState).toHaveBeenCalledWith(store.defaultState);
        });
    });

    describe('#getStatus', () => {
        it('should return actual state status', () => {
            expect(store.getStatus()).toBe(asyncStatuses.ready);
        });
    });

    describe('#getResource', () => {
        it('should return actual resource', () => {
            store.resource = resource;
            expect(store.getResource()).toBe(resource);
        });
    });

    describe('#get', () => {
        let passedStore: any = {};
        let passedStoreState = 'passedStoreState';

        beforeEach(() => {
            passedStore.setDependency = jest.fn().mockName('setDependency');
            passedStore.getState = jest.fn().mockName('getState').mockReturnValue(passedStoreState);
        });

        it('should register store as dependency of passed store to fire it on update', () => {
            store.get(passedStore);
            expect(passedStore.setDependency).toHaveBeenCalledWith(store.getId());
        });

        it('should return state of passed store', () => {
            expect(store.get(passedStore)).toBe(passedStoreState);
        });
    });

    describe('#updateState', () => {
        beforeEach(() => {
            store.setAdaptedState = jest.fn().mockName('setAdaptedState');
            store.triggerDependencies = jest.fn().mockName('triggerDependencies');
            store.getAdaptedState = jest
                .fn()
                .mockName('getAdaptedState')
                .mockReturnValue(updatedState);
        });

        it('should do nothing if passed state the same with actual state', () => {
            store.updateState(state);
            expect(store.setAdaptedState).not.toHaveBeenCalled();
            expect(store.triggerDependencies).not.toHaveBeenCalled();
        });

        it('should adapt state and set it and then trigger dependencies', () => {
            store.updateState(newState);
            expect(store.getAdaptedState).toHaveBeenCalledWith(newState);
            expect(store.setAdaptedState).toHaveBeenCalledWith(updatedState);
            expect(store.triggerDependencies).toHaveBeenCalled();
        });
    });

    describe('#setAdaptedState', () => {
        it('should set state', () => {
            store.setAdaptedState(updatedState);
            expect(store.state).toBe(updatedState);
        });
    });

    describe('#setAsyncStatus', () => {
        it('should set status as pending for async state', () => {
            store.isStateAsync = true;
            store.setAsyncStatus();
            expect(store.status).toBe(asyncStatuses.pending);
        });

        it('should set status as ready for sync state', () => {
            store.isStateAsync = false;
            store.setAsyncStatus();
            expect(store.status).toBe(asyncStatuses.ready);
        });
    });

    describe('#getAdaptedState', () => {
        beforeEach(() => {
            store.integrateAsyncState = jest
                .fn()
                .mockName('integrateAsyncState')
                .mockReturnValue(updatedState);
        });

        it('should return passed state is is is not async', () => {
            expect(store.getAdaptedState(newState)).toBe(newState);
            expect(store.integrateAsyncState).not.toHaveBeenCalled();
        });

        it('should return state with additional setters of status and resource for async state', () => {
            store.isStateAsync = true;
            expect(store.getAdaptedState(newState)).toBe(updatedState);
            expect(store.integrateAsyncState).toHaveBeenCalledWith(newState);
        });
    });

    describe('#integrateAsyncState', () => {
        let asyncState: any;

        beforeEach(() => {
            asyncState = Promise.resolve(resource);
            store.triggerDependencies = jest.fn().mockName('triggerDependencies');
            store.setAsyncResource = jest
                .fn()
                .mockName('integrateAsyncState')
                .mockImplementation((status: any) => status);
            store.performCBAndNext = jest
                .fn()
                .mockName('performCBAndNext')
                .mockImplementation(() => (resource: any) => resource);
        });

        it('should set passed state as actual', () => {
            store.integrateAsyncState(asyncState);
            expect(store.actualState).toBe(asyncState);
        });

        it('should return wrapped promise with the same resolved values', async () => {
            expect(await store.integrateAsyncState(asyncState)).toBe(resource);
        });

        it('should add middlewares to async state to update status and resource', async () => {
            await store.integrateAsyncState(asyncState);

            expect(store.setAsyncResource).toHaveBeenCalledWith(asyncStatuses.ready);
            expect(store.performCBAndNext).toHaveBeenCalledWith(asyncStatuses.ready, asyncState);
            expect(store.performCBAndNext).toHaveBeenCalledWith(asyncStatuses.error, asyncState);

            let [
                ,
                ,
                [boundTriggerDependencies, passedAsyncState],
            ] = store.performCBAndNext.mock.calls;
            expect(store.triggerDependencies).not.toHaveBeenCalled();
            boundTriggerDependencies();
            expect(store.triggerDependencies).toHaveBeenCalled();
            expect(passedAsyncState).toBe(asyncState);
        });
    });

    describe('#performCBAndNext', () => {
        let callback: any;

        beforeEach(() => {
            callback = jest.fn().mockName('callback');
        });

        it('should return callback call of which will return passed argument', () => {
            expect(store.performCBAndNext()(resource)).toBe(resource);
        });

        it('returned function should call closure callback with passed resource if passed state is still actual', () => {
            store.actualState = updatedState;
            let fn = store.performCBAndNext(callback, updatedState);

            expect(callback).not.toHaveBeenCalled();

            fn(resource);
            expect(callback).toHaveBeenCalledWith(resource);
        });

        it('returned function should not call closure callback if passed state is not actual', () => {
            store.actualState = updatedState;
            let fn = store.performCBAndNext(callback, state);

            fn(resource);
            expect(callback).not.toHaveBeenCalled();
        });
    });

    describe('#setAsyncResource', () => {
        it('should return callback which will set passed status and resource', () => {
            store.status = asyncStatuses.pending;
            let callback = store.setAsyncResource(asyncStatuses.ready);

            expect(store.status).not.toBe(asyncStatuses.ready);
            expect(store.resource).toBeNull();

            callback(resource);

            expect(store.status).toBe(asyncStatuses.ready);
            expect(store.resource).toBe(resource);
        });
    });
});
