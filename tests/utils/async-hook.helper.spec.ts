import {
    getAsyncResource,
    getResolvedResource,
    throwError,
    throwPendingState,
} from 'src/utils/async-hook.helper';

import { asyncStatuses } from 'src/models';

const getCaughtError = (cb: any) => {
    try {
        cb();
    } catch (error) {
        return error;
    }
};

describe('async hook helper', () => {
    let store: any = {};
    let pendingState = 'pendingState';
    let resource = 'resource';

    beforeEach(() => {
        store.getState = jest.fn().mockName('getState').mockReturnValue(pendingState);
        store.getResource = jest.fn().mockName('getResource').mockReturnValue(resource);
        store.getStatus = jest
            .fn()
            .mockName('getStatus')
            .mockImplementation(() => store.status);
    });

    describe('#getAsyncResource', () => {
        it('should return resolved resource if store status is ready', () => {
            store.status = asyncStatuses.ready;
            expect(getAsyncResource(store)()).toBe(resource);
        });

        it('should throw error with pending state is state is in pending status', () => {
            store.status = asyncStatuses.pending;
            expect(getCaughtError(getAsyncResource(store))).toBe(pendingState);
        });

        it('should throw error if async state was rejected', () => {
            store.status = asyncStatuses.error;
            expect(getCaughtError(getAsyncResource(store))).toBe(resource);
        });
    });

    describe('#getResolvedResource', () => {
        it('should return resolved resource of async store', () => {
            expect(getResolvedResource(store)).toBe(resource);
        });
    });

    describe('#throwError', () => {
        it('should throw error if async store resource was rejected', () => {
            expect(getCaughtError(() => throwError(store))).toBe(resource);
        });
    });

    describe('#throwPendingState', () => {
        it('should throw pending sate if async store is in pending status', () => {
            expect(getCaughtError(() => throwPendingState(store))).toBe(pendingState);
        });
    });
});
