import { derivedStores } from '../stores';

import { IBaseStore, IDerivedStore, IDerivedStores, Trigger } from '../models';

export class BaseStore<T> implements IBaseStore<T> {
    private triggers: Set<Trigger> = new Set();
    private dependencies: Set<symbol> = new Set();
    private readonly derivedStores: IDerivedStores = derivedStores;
    protected isStateAsync = false;

    constructor(private readonly id: symbol) {}

    setDerivedStore(derivedStore: IDerivedStore<T>): void {
        this.derivedStores.setDerivedStore(derivedStore);
    }

    setTrigger(trigger: Trigger): void {
        if (!this.triggers.has(trigger)) {
            this.triggers.add(trigger);
        }
    }

    removeTrigger(trigger: Trigger): void {
        this.triggers.delete(trigger);
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

    protected triggerDependencies(): void {
        this.triggerDerivedStates();
        this.fireTriggers();
    }

    private triggerDerivedStates(): void {
        this.derivedStores.triggerDerivedStores(this.dependencies);
    }

    private fireTriggers(): void {
        this.triggers.forEach((trigger) => trigger());
    }
}
