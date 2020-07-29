export enum asyncStatuses {
    ready = 'ready',
    error = 'error',
    pending = 'pending',
}

type Trigger = () => void;
type GetState = <T>(store: IStore<T>) => T;
type UpdateState<T> = (state: T) => T;

type GetStateCallback<T> = () => T;
type LinkedStoreState<T> = {
    state: T;
    getState: GetStateCallback<T>;
};

export type SetState<T> = (state: T | UpdateState<T> | void) => void;

interface IBaseStore<T> {
    getId(): symbol;
    setTriggerHook(trigger: Trigger): void;
    removeTriggerHook(trigger: Trigger): void;
    setDependency(dependencyId: symbol): void;
    setDerivedStore(store: IDerivedStore<T>): void;
    isAsync(): boolean;
}

interface ISimpleStore<T> extends IBaseStore<T> {
    getState(): T;
    setState: SetState<T>;
    resetState(): void;
}

interface IDerivedStore<T> extends ISimpleStore<T> {
    getStatus(): asyncStatuses;
    getResult(): T;
}

type IStore<T> = ISimpleStore<T> | IDerivedStore<T>;

export function simpleStore<T>(state: T): IStore<T>;
export function derivedStore<T>(getter: (get: GetState) => T): IDerivedStore<T>;

export function useLinkedStoreValue<T>(store: IStore<T>): LinkedStoreState<T>;
export function useSetLinkedStore<T>(store: IStore<T>): SetState<T>;
export function useResetLinkedStore<T>(store: IStore<T>): () => void;
export function useLinkedStore<T>(store: IStore<T>): [LinkedStoreState<T>, SetState<T>];

export function useAsyncLinkedValue<T>(store: IDerivedStore<Promise<T>>): Promise<T>;
export function useAsyncLinkedStore<T>(store: IDerivedStore<T>): [T, SetState<T>];
