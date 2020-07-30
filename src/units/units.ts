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

class DerivedStore<T, R = T> extends BaseStore<T, R> implements IDerivedStore<T, R> {
    private readonly defaultState: T;
    private state: T;

    private status: asyncStatuses = asyncStatuses.pending;
    private resource: R;

    constructor(private getter: Getter<T>) {
        super(Symbol('derived-store'));

        const state = this.getter(this.get);
        this.setAsyncFlag(state instanceof Promise);

        const adaptedState = this.getAdaptedState(state);
        this.defaultState = adaptedState;
        this.state = adaptedState;
        this.resource = (adaptedState as unknown) as R;

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

    getResource(): R {
        return this.resource;
    }

    private get: GetState = <T, R>(store: IStore<T, R>): T => {
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
        this.resource = (adaptedState as unknown) as R;
    }

    private getAdaptedState(updatedState: T): T {
        this.status = this.isStateAsync ? asyncStatuses.pending : asyncStatuses.ready;

        if (this.isStateAsync) {
            return (this.integrateAsyncState(
                (updatedState as unknown) as Promise<R>
            ) as unknown) as T;
        }

        return updatedState;
    }

    private integrateAsyncState(promise: Promise<R>): Promise<R> {
        return promise
            .then(this.setAsyncResource(asyncStatuses.ready))
            .catch(this.setAsyncResource(asyncStatuses.error));
    }

    private setAsyncResource = (status: asyncStatuses) => (resource: R): R => {
        this.resource = resource;
        this.status = status;

        return resource;
    };
}

export const simpleStore = <T>(state: T): IStore<T> => new SimpleStore<T>(state);
export const derivedStore = <T, R = T>(getter: Getter<T>): IDerivedStore<T, R> =>
    new DerivedStore<T, R>(getter);
