export enum asyncStatuses {
    ready = 'ready',
    error = 'error',
    pending = 'pending',
}

export type Trigger = () => void;

export type DerivedState<T> = T | Promise<T>;

export type GetState = <T>(store: IStore<T>) => DerivedState<T>;
export type Getter<T> = (get: GetState) => T | Promise<T>;

export type UpdateState<T> = (state: T) => T;

export type SetState<T> = (state: T | UpdateState<T> | void) => void;

export type GetStateCallback<T> = () => T;
export type LinkedStoreState<T> = [T, GetStateCallback<T>];

export interface IBaseStore<T> {
    getId(): symbol;
    setTrigger(trigger: Trigger): void;
    removeTrigger(trigger: Trigger): void;
    setDependency(dependencyId: symbol): void;
    setDerivedStore(store: IDerivedStore<T>): void;
    isAsync(): boolean;
}

export type CommonMethods<T> = {
    setState: SetState<T>;
    resetState(): void;
};

export interface ISimpleStore<T> extends IBaseStore<T>, CommonMethods<T> {
    getState(): T;
}

export interface IDerivedStore<T> extends IBaseStore<T>, CommonMethods<T> {
    getStatus(): asyncStatuses;
    getResource(): T;
    getState(): DerivedState<T>;
}

export type IStore<T> = ISimpleStore<T> | IDerivedStore<T>;

export interface IDerivedStores {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setDerivedStore(store: IDerivedStore<any>): void;
    triggerDerivedStores(ids: Set<symbol>): void;
}
