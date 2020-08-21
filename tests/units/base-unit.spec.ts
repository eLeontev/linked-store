import { BaseStore } from 'src/units/base-unit';
import { derivedStores } from 'src/stores';

describe('BaseStore', () => {
    let store: any;
    let id = Symbol('id');
    let trigger: any = 'trigger';

    beforeEach(() => {
        store = new BaseStore(id);
    });

    it('#init state', () => {
        expect(store.triggers.size).toBe(0);
        expect(store.dependencies.size).toBe(0);
        expect(store.derivedStores).toBe(derivedStores);
        expect(store.isStateAsync).toBeFalsy();
    });

    describe('#setDerivedStore', () => {
        beforeEach(() => {
            store.derivedStores = {
                setDerivedStore: jest.fn().mockName('setDerivedStore'),
            };
        });

        it('should set passed derived store to derived stores', () => {
            let derivedStore = 'derivedStore';
            store.setDerivedStore(derivedStore);
            expect(store.derivedStores.setDerivedStore).toHaveBeenCalledWith(derivedStore);
        });
    });

    describe('#setTrigger', () => {
        it('should set passed trigger it if does not exist', () => {
            store.setTrigger(trigger);
            expect(store.triggers.has(trigger)).toBeTruthy();
            expect(store.triggers.size).toBe(1);

            store.setTrigger(trigger);
            expect(store.triggers.size).toBe(1);
        });
    });

    describe('#removeTrigger', () => {
        it('should remove passed trigger from triggers', () => {
            store.setTrigger(trigger);
            expect(store.triggers.size).toBe(1);

            store.removeTrigger(trigger);
            expect(store.triggers.size).toBe(0);
        });
    });

    describe('#getId', () => {
        it('should return store id', () => {
            expect(store.getId()).toBe(id);
        });
    });

    describe('#setDependency', () => {
        let dependencyId = Symbol('dependencyId');

        it('should set passed dependency id it if does not exist', () => {
            store.setDependency(dependencyId);
            expect(store.dependencies.has(dependencyId)).toBeTruthy();
            expect(store.dependencies.size).toBe(1);

            store.setDependency(dependencyId);
            expect(store.dependencies.size).toBe(1);
        });
    });

    describe('#isAsync', () => {
        it('should return true if state is async', () => {
            store.isStateAsync = true;
            expect(store.isAsync()).toBeTruthy();
        });

        it('should return false if state is sync', () => {
            store.isStateAsync = false;
            expect(store.isAsync()).toBeFalsy();
        });
    });

    describe('#setAsyncFlag', () => {
        let isStateAsync: any = 'isStateAsync';

        it('should set async status of state', () => {
            store.setAsyncFlag(isStateAsync);
            expect(store.isStateAsync).toBe(isStateAsync);
        });
    });

    describe('#triggerDependencies', () => {
        beforeEach(() => {
            store.triggerDerivedStates = jest.fn().mockName('triggerDerivedStates');
            store.fireTriggers = jest.fn().mockName('fireTriggers');
        });

        it('should trigger dependent derived states and fire dependent triggers', () => {
            store.triggerDependencies();
            expect(store.triggerDerivedStates).toHaveBeenCalled();
            expect(store.fireTriggers).toHaveBeenCalled();
        });
    });

    describe('#triggerDerivedStates', () => {
        let dependencies = 'dependencies';

        beforeEach(() => {
            store.derivedStores.triggerDerivedStores = jest.fn().mockName('triggerDerivedStores');
        });

        it('should trigger dependent derived stores', () => {
            store.dependencies = dependencies;
            store.triggerDerivedStates();
            expect(store.derivedStores.triggerDerivedStores).toHaveBeenCalledWith(dependencies);
        });
    });

    describe('#fireTriggers', () => {
        let trigger1: any;
        let trigger2: any;

        beforeEach(() => {
            trigger1 = jest.fn().mockName('trigger1');
            trigger2 = jest.fn().mockName('trigger2');

            store.triggers.add(trigger1);
            store.triggers.add(trigger2);
        });

        it('should fire each storied triggers', () => {
            store.fireTriggers();
            expect(trigger1).toHaveBeenCalled();
            expect(trigger2).toHaveBeenCalled();
        });
    });
});
