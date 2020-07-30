export enum asyncStatuses {
    ready = 'ready',
    error = 'error',
    pending = 'pending',
}

export type Trigger = () => void;

export type GetState = <T, R = T>(store: IStore<T, R>) => T;
export type Getter<T> = (get: GetState) => T;

export type UpdateState<T> = (state: T) => T;

export type SetState<T> = (state: T | UpdateState<T> | void) => void;

export type GetStateCallback<T> = () => T;

export interface IBaseStore<T, R = T> {
    getId(): symbol;
    setTrigger(trigger: Trigger): void;
    removeTrigger(trigger: Trigger): void;
    setDependency(dependencyId: symbol): void;
    setDerivedStore(store: IDerivedStore<T, R>): void;
    isAsync(): boolean;
}

export interface ISimpleStore<T, R = T> extends IBaseStore<T, R> {
    getState(): T;
    setState: SetState<T>;
    resetState(): void;
}

export interface IDerivedStore<T, R> extends ISimpleStore<T, R> {
    getStatus(): asyncStatuses;
    getResource(): R;
}

export type IStore<T, R = T> = ISimpleStore<T> | IDerivedStore<T, R>;

export function simpleStore<T>(state: T): IStore<T, T>;
export function derivedStore<T, R = T>(get: Getter<T>): IDerivedStore<T, R>;

export function useLinkedStoreValue<T, R = T>(store: IStore<T, R>): [T, GetStateCallback<R>];
export function useSetLinkedStore<T, R = T>(store: IStore<T, R>): SetState<T>;
export function useResetLinkedStore<T, R = T>(store: IStore<T, R>): () => void;
export function useLinkedStore<T, R = T>(
    store: IStore<T, R>
): [T, SetState<T>, GetStateCallback<R>];

export function useAsyncLinkedStoreValue<T, R = T>(store: IDerivedStore<T, R>): R;
export function useAsyncLinkedStore<T, R = T>(store: IDerivedStore<T>): [R, SetState<T>];
