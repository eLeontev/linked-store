export enum asyncStatuses {
    ready = 'ready',
    error = 'error',
    pending = 'pending',
}

type Trigger = () => void;
type GetState = <T>(store: IStore<T>) => T;
type UpdateState<T> = (state: T) => T;

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

export function useLinkedStateValue<T>(store: IStore<T>): T;
export function useSetLinkedState<T>(state: IStore<T>): SetState<T>;
export function useResetLinkedState<T>(state: IStore<T>): () => void;
export function useLinkedState<T>(state: IStore<T>): [T, (state: T) => void];
