type SyncCb<T> = () => T;
type AsyncCb<T> = () => Promise<T>;
type Callback<T> = SyncCb<T> | AsyncCb<T>;
const cb = <T>(get: Callback<T>): Promise<T> | T => get();


const res = cb(() => 123);
