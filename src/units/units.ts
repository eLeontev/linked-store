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

        const state = this.getter(this.get);
        this.setAsyncFlag(state instanceof Promise);

        const adaptedState = this.getAdaptedState(state);
        this.defaultState = adaptedState;
        this.state = adaptedState;
        this.result = adaptedState;

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
            this.setAdaptedState(this.getAdaptedState(updatedState));

            this.triggerDependencies();
        }
    }

    private setAdaptedState(adaptedState: T): void {
        this.state = adaptedState;
        this.result = adaptedState;
    }

    private getAdaptedState(updatedState: T): T {
        this.status = this.isStateAsync ? asyncStatuses.pending : asyncStatuses.ready;

        if (this.isStateAsync) {
            return (this.integrateAsyncState(
                (updatedState as unknown) as Promise<T>
            ) as unknown) as T;
        }

        return updatedState;
    }

    private integrateAsyncState(promise: Promise<T>): Promise<void> {
        return promise
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
