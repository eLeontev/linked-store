export enum asyncStatuses {
    ready = 'ready',
    error = 'error',
    pending = 'pending',
}

export type Trigger = () => void;

export type GetState = <T>(store: IStore<T>) => T;
export type Getter<T> = (get: GetState) => T;

export type UpdateState<T> = (state: T) => T;

export type SetState<T> = (state: T | UpdateState<T> | void) => void;

export interface IBaseStore<T> {
    getId(): symbol;
    setTriggerHook(trigger: Trigger): void;
    removeTriggerHook(trigger: Trigger): void;
    setDependency(dependencyId: symbol): void;
    setDerivedStore(store: IDerivedStore<T>): void;
    isAsync(): boolean;
}

export interface ISimpleStore<T> extends IBaseStore<T> {
    getState(): T;
    setState: SetState<T>;
    resetState(): void;
}

export interface IDerivedStore<T> extends ISimpleStore<T> {
    getStatus(): asyncStatuses;
    getResult(): T;
}

export type IStore<T> = ISimpleStore<T> | IDerivedStore<T>;

export interface IDerivedStores {
    setDerivedStore(store: IDerivedStore<any>): void;
    triggerDerivedStores(ids: Set<symbol>): void;
}
