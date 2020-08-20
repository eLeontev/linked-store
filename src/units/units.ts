import { BaseStore } from './base-unit';

import {
    asyncStatuses,
    GetState,
    Getter,
    IDerivedStore,
    ISimpleStore,
    IStore,
    Resource,
    State,
    UpdateState,
} from '../models';

class SimpleStore<T> extends BaseStore<T> implements ISimpleStore<T> {
    private state: State<T>;

    constructor(private defaultState: State<T>) {
        super(Symbol('store'));
        this.state = defaultState;
    }

    getState(): State<T> {
        return this.state;
    }

    setState = (state: State<T> | UpdateState<State<T>> | void): void => {
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

    private getUpdatedState(state: State<T> | UpdateState<State<T>>): State<T> {
        return typeof state === 'function' ? (state as UpdateState<State<T>>)(this.state) : state;
    }
}

class DerivedStore<T> extends BaseStore<T> implements IDerivedStore<T> {
    private readonly defaultState: State<T>;
    private state: State<T>;
    private actualState: State<T> | null = null;

    private status: asyncStatuses = asyncStatuses.pending;
    private resource: Resource<T> = null as Resource<T>;

    constructor(private getter: Getter<T>) {
        super(Symbol('derived-store'));

        const state = this.getter(this.get);
        this.setAsyncFlag(state instanceof Promise);

        const adaptedState = this.getAdaptedState(state);
        this.defaultState = adaptedState;
        this.state = adaptedState;

        this.setDerivedStore(this);
    }

    getState(): State<T> {
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

    getResource(): Resource<T> {
        return this.resource;
    }

    private get: GetState = <T>(store: IStore<T>): State<T> => {
        store.setDependency(this.getId());
        return store.getState();
    };

    private updateState(updatedState: State<T>): void {
        if (updatedState !== this.state) {
            this.setAdaptedState(this.getAdaptedState(updatedState));
            this.triggerDependencies();
        }
    }

    private setAdaptedState(adaptedState: State<T>): void {
        this.state = adaptedState;
    }

    private getAdaptedState(updatedState: State<T>): State<T> {
        this.status = this.isStateAsync ? asyncStatuses.pending : asyncStatuses.ready;

        if (this.isStateAsync) {
            return this.integrateAsyncState(updatedState);
        }

        return updatedState;
    }

    private integrateAsyncState(state: State<T>): State<T> {
        this.actualState = state;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (state as any)
            .then(this.performCBAndNext(this.setAsyncResource(asyncStatuses.ready), state))
            .catch(this.performCBAndNext(this.setAsyncResource(asyncStatuses.error), state))
            .then(this.performCBAndNext(this.triggerDependencies.bind(this), state)) as State<T>;
    }

    private performCBAndNext = (cb: (resource: Resource<T>) => void, state: State<T>) => (
        resource: Resource<T>
    ): Resource<T> => {
        if (this.actualState === state) {
            cb(resource);
        }

        return resource;
    };

    private setAsyncResource = (status: asyncStatuses) => (resource: Resource<T>): void => {
        this.resource = resource;
        this.status = status;
    };
}

export const simpleStore = <T>(state: State<T>): IStore<T> => new SimpleStore<T>(state);
export const derivedStore = <T>(getter: Getter<T>): IDerivedStore<T> => new DerivedStore<T>(getter);
