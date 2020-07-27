import { IDerivedStore, IDerivedStores } from './models';

export class DerivedStores implements IDerivedStores {
    private derivedStores = new Map<symbol, IDerivedStore<any>>();

    public setDerivedStore(store: IDerivedStore<any>): void {
        this.derivedStores.set(store.getId(), store);
    }

    public triggerDerivedStores<T>(ids: Set<symbol>): void {
        // @ts-ignore
        ids.forEach((id: symbol) => this.derivedStores.get(id).setState());
    }
}

export const derivedStores = new DerivedStores();
