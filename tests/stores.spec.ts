import { DerivedStores } from 'src/stores';

describe('DerivedStores', () => {
    let derivedStores: any;

    let id1 = 'id1';
    let id2 = 'id2';
    let id3 = 'id3';

    let store1: any;
    let store2: any;
    let store3: any;

    beforeEach(() => {
        store1 = {
            setState: jest.fn().mockName('setState'),
            getId: jest.fn().mockName('getId').mockReturnValue(id1),
        };
        store2 = {
            setState: jest.fn().mockName('setState'),
            getId: jest.fn().mockName('getId').mockReturnValue(id2),
        };
        store3 = {
            setState: jest.fn().mockName('setState'),
            getId: jest.fn().mockName('getId').mockReturnValue(id3),
        };
    });

    beforeEach(() => {
        derivedStores = new DerivedStores();
    });

    describe('#setDerivedStore', () => {
        it('should set passed store to map of saved stores and use store id as its key', () => {
            derivedStores.setDerivedStore(store1);
            expect(derivedStores.derivedStores.size).toBe(1);
            expect(derivedStores.derivedStores.get(id1)).toBe(store1);
            expect(store1.getId).toHaveBeenCalled();
        });
    });

    describe('#triggerDerivedStores', () => {
        const ids = [id1, id2];

        beforeEach(() => {
            derivedStores.setDerivedStore(store1);
            derivedStores.setDerivedStore(store2);
            derivedStores.setDerivedStore(store3);
        });

        it('should set state for all stored stores for passed ids', () => {
            expect(derivedStores.derivedStores.size).toBe(3);

            derivedStores.triggerDerivedStores(ids);

            expect(store1.setState).toHaveBeenCalled();
            expect(store2.setState).toHaveBeenCalled();
            expect(store3.setState).not.toHaveBeenCalled();
        });
    });
});
