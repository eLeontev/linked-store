import { IDerivedStore, IDerivedStores } from './models';

export class DerivedStores implements IDerivedStores {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private derivedStores = new Map<symbol, IDerivedStore<any>>();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public setDerivedStore(store: IDerivedStore<any>): void {
        this.derivedStores.set(store.getId(), store);
    }

    public triggerDerivedStores<T>(ids: Set<symbol>): void {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        ids.forEach((id: symbol) => this.derivedStores.get(id).setState());
    }
}

export const derivedStores = new DerivedStores();
