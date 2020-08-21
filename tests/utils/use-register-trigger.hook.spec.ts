import { useEffect, useState } from 'react';
import { useRegisterTrigger } from 'src/utils/use-register-trigger.hook';

describe('useRegisterTrigger', () => {
    let store: any = {};
    let setState: any;

    beforeEach(() => {
        setState = jest.fn().mockName('setState');
        (useState as any).mockReturnValue([, setState]);
    });

    beforeEach(() => {
        store.setTrigger = jest.fn().mockName('setTrigger');
        store.removeTrigger = jest.fn().mockName('removeTrigger');
    });

    it('should call #useState to use its setter as trigger and #useEffect to set the trigger to store', () => {
        useRegisterTrigger(store);

        expect(useState).toHaveBeenCalledWith({});
        expect(useEffect).toHaveBeenCalled();
    });

    describe('#useEffect', () => {
        let useEffectCallback: any;
        let useEffectDeps: any;
        beforeEach(() => {
            (useEffect as any).mockImplementation((cb: any, deps: any[]) => {
                useEffectCallback = cb;
                useEffectDeps = deps;
            });
        });

        beforeEach(() => {
            useRegisterTrigger(store);
        });

        it('should update #useEffect only on store or setState update (on mount any component only)', () => {
            expect(useEffectDeps).toEqual([store, setState]);
        });

        it('should wrap setState to trigger and set it to the passed store', () => {
            useEffectCallback();
            let [[trigger]] = store.setTrigger.mock.calls;
            expect(store.setTrigger).toHaveBeenCalledWith(trigger);

            expect(setState).not.toHaveBeenCalled();

            trigger();
            expect(setState).toHaveBeenCalledWith({});
        });

        it('should should remove trigger on component unmount', () => {
            let unmountCallback = useEffectCallback();
            let [[trigger]] = store.setTrigger.mock.calls;

            expect(store.removeTrigger).not.toHaveBeenCalled();

            unmountCallback();
            expect(store.removeTrigger).toHaveBeenCalledWith(trigger);
        });
    });
});
