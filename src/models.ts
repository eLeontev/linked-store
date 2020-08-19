export const enum asyncStatuses {
    ready = 'ready',
    error = 'error',
    pending = 'pending',
}

export type Trigger = () => void;

export type GetState = <T>(store: IStore<T>) => State<T>;
export type Getter<T> = (get: GetState) => State<T>;

export type UpdateState<T> = (state: T) => T;

export type SetState<T> = (state: State<T> | UpdateState<State<T>> | void) => void;

export type GetStateCallback<T> = () => State<T>;

export interface IBaseStore<T> {
    getId(): symbol;
    setTrigger(trigger: Trigger): void;
    removeTrigger(trigger: Trigger): void;
    setDependency(dependencyId: symbol): void;
    setDerivedStore(store: IDerivedStore<T>): void;
    isAsync(): boolean;
}

export interface ISimpleStore<T> extends IBaseStore<T> {
    getState: GetStateCallback<T>;
    setState: SetState<T>;
    resetState(): void;
}

export type State<T> = T extends Promise<infer R> ? Promise<R> : T;
export type Resource<T> = T extends Promise<infer R> ? R : T;

export type ResourceHandler = <T>(store: IDerivedStore<T>) => Resource<T>;

export interface IDerivedStore<T> extends ISimpleStore<T> {
    getStatus(): asyncStatuses;
    getResource(): Resource<T>;
}

export type IStore<T> = ISimpleStore<T> | IDerivedStore<T>;

export interface IDerivedStores {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setDerivedStore(store: IDerivedStore<any>): void;
    triggerDerivedStores(ids: Set<symbol>): void;
}

export type GetStateHookCallback<T> = GetStateCallback<Resource<T>>;
