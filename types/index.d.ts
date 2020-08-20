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

export type GetStateCallback<T> = () => T;
export type GetStateHookCallback<T> = GetStateCallback<T extends Promise<T> ? Resource<T> : T>;

export type Resource<T> = T extends Promise<infer R> ? R : T;

export interface IBaseStore<T> {
    getId(): symbol;
    setTrigger(trigger: Trigger): void;
    removeTrigger(trigger: Trigger): void;
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
    getResource(): Resource<T>;
}

export type IStore<T> = ISimpleStore<T> | IDerivedStore<T>;

export function simpleStore<T>(state: T): IStore<T>;
export function derivedStore<T>(get: Getter<T>): IDerivedStore<T>;

export function getAsyncResource<T>(store: IDerivedStore<T>): GetStateCallback<Resource<T>>;

export function useLinkedStoreValue<T>(store: IStore<T>): [T, GetStateHookCallback<T>];
export function useSetLinkedStore<T>(store: IStore<T>): SetState<T>;
export function useResetLinkedStore<T>(store: IStore<T>): () => void;
export function useLinkedStore<T>(store: IStore<T>): [T, SetState<T>, GetStateHookCallback<T>];

export function useAsyncLinkedStoreValue<T>(store: IDerivedStore<T>): Resource<T>;
export function useAsyncLinkedStore<T>(store: IDerivedStore<T>): [Resource<T>, SetState<T>];

export type AsyncWithLoaderResult<T, E> = {
    isLoading: boolean;
    data: Resource<T>;
    error: E | null;
};

export function useAsyncWithLoaderLinkedStore<T, E = string>(
    store: IDerivedStore<T>
): AsyncWithLoaderResult<T, E>;
