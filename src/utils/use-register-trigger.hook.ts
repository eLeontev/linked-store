// eslint-disable-next-line @typescript-eslint/no-var-requires
const { useEffect, useState } = require('react');

import { IStore } from '../models';

export const useRegisterTrigger = <T>(store: IStore<T>): void => {
    const [, setState] = useState({});

    useEffect(() => {
        const trigger = () => setState({});
        store.setTrigger(trigger);

        return (): void => store.removeTrigger(trigger);
    }, [store, setState]);
};
