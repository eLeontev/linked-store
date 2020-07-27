import { BaseStore } from './base-unit';

import {
    asyncStatuses,
    GetState,
    Getter,
    IDerivedStore,
    ISimpleStore,
    IStore,
    UpdateState,
} from '../models';

class SimpleStore<T> extends BaseStore<T> implements ISimpleStore<T> {
    private state: T;

    constructor(private defaultState: T) {
        super(Symbol('store'));
        this.state = defaultState;
    }

    getState(): T {
        return this.state;
    }

    setState = (state: T | UpdateState<T> | void): void => {
        if (state === undefined) {
            throw new Error('state should be passed');
        }

        const updatedState = this.getUpdatedState(state);

        if (updatedState !== this.state) {
            this.state = updatedState;
            this.triggerDependencies();
        }
    };

    resetState = (): void => {
        this.setState(this.defaultState);
    };

    private getUpdatedState(state: T | UpdateState<T>): T {
        return typeof state === 'function' ? (state as UpdateState<T>)(this.state) : state;
    }
}

class DerivedStore<T> extends BaseStore<T> implements IDerivedStore<T> {
    private readonly defaultState: T;
    private state: T;

    private status: asyncStatuses = asyncStatuses.pending;
    private result: T;

    constructor(private getter: Getter<T>) {
        super(Symbol('derived-store'));

        this.state = this.getter(this.get);
        this.defaultState = this.state;
        this.result = this.state;

        this.setAsyncFlag(this.state instanceof Promise);

        this.adaptStateForHooks();
        this.setDerivedStore(this);
    }

    getState(): T {
        return this.state;
    }

    setState = (): void => {
        this.updateState(this.getter(this.get));
    };

    resetState = (): void => {
        this.updateState(this.defaultState);
    };

    getStatus(): asyncStatuses {
        return this.status;
    }

    getResult(): T {
        return this.result;
    }

    private get: GetState = <T>(store: IStore<T>): T => {
        store.setDependency(this.getId());
        return store.getState();
    };

    private updateState(updatedState: T): void {
        if (updatedState !== this.state) {
            this.state = updatedState;
            this.result = this.state;

            this.adaptStateForHooks();
            this.triggerDependencies();
        }
    }

    private adaptStateForHooks(): void {
        this.status = this.isStateAsync ? asyncStatuses.pending : asyncStatuses.ready;

        if (this.isStateAsync) {
            this.integrateWithHooks((this.state as unknown) as Promise<T>);
        }
    }

    private integrateWithHooks(promise: Promise<T>) {
        promise
            .then(this.setAsyncResult(asyncStatuses.ready))
            .catch(this.setAsyncResult(asyncStatuses.error));
    }

    private setAsyncResult = (status: asyncStatuses) => (result: T) => {
        this.result = result;
        this.status = status;
    };
}

export const simpleStore = <T>(state: T): IStore<T> => new SimpleStore<T>(state);
export const derivedStore = <T>(getter: (get: GetState) => T): IDerivedStore<T> =>
    new DerivedStore<T>(getter);
