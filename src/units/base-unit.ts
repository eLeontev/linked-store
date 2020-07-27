import { derivedStores } from '../stores';

import { IBaseStore, IDerivedStore, IDerivedStores, Trigger } from '../models';

export class BaseStore<T> implements IBaseStore<T> {
    private hookTriggers: Set<Trigger> = new Set();
    private dependencies: Set<symbol> = new Set();
    private readonly derivedStores: IDerivedStores = derivedStores;
    protected isStateAsync: boolean = false;

    constructor(private readonly id: symbol) {}

    setDerivedStore(derivedStore: IDerivedStore<T>) {
        this.derivedStores.setDerivedStore(derivedStore);
    }

    setTriggerHook(trigger: Trigger): void {
        if (!this.hookTriggers.has(trigger)) {
            this.hookTriggers.add(trigger);
        }
    }

    removeTriggerHook(trigger: Trigger): void {
        this.hookTriggers.delete(trigger);
    }

    getId(): symbol {
        return this.id;
    }

    setDependency(dependencyId: symbol): void {
        if (!this.dependencies.has(dependencyId)) {
            this.dependencies.add(dependencyId);
        }
    }

    isAsync(): boolean {
        return this.isStateAsync;
    }

    protected setAsyncFlag(isStateAsync: boolean): void {
        this.isStateAsync = isStateAsync;
    }

    protected triggerDerivedStates(): void {
        this.derivedStores.triggerDerivedStores(this.dependencies);
    }

    protected triggerHooks(): void {
        this.hookTriggers.forEach((trigger) => trigger());
    }

    protected triggerDependencies = (): void => {
        this.triggerDerivedStates();
        this.triggerHooks();
    };
}
