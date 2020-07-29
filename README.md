# linked-store ![Status](https://travis-ci.org/eLeontev/linked-store.svg?branch=master)

## Description

tiny state-management library inspired by recoil

## Installation
```shell script
npm install --save linked-store
``` 

## API

### Stores

-   simpleStore: `<T>(state: T): IStore<T>`

##### Usage:

```javascript
import { simpleStore } from 'linked-store';

const dirtyState = simpleStore(false);

dirtyState.setState(true);
expect(dirtyState.getState()).toBeTruthy();

dirtyState.resetState();
expect(dirtyState.getState()).toBeFalsy();

dirtyState.setState((state) => !state);
expect(dirtyState.getState()).toBeTruthy();
```

-   derivedStore: `<T>(getter: (get: GetState) => T): IDerivedStore<T>`

##### Usage:

```javascript
// trivial usage
import { derivedStore } from 'linked-store';

const incrementState = simpleStore(0);

const incrementX4State = derivedStore((get) => get(incrementState) * 4);

dirtyState.setState(1);
expect(incrementX4State.getState()).toBe(4);

dirtyState.setState((state) => state + 1);
expect(incrementX4State.getState()).toBe(8);
```

```javascript
// async usage
import { derivedStore } from 'linked-store';
const userDetails = { name: 'userName' };
const fetchUserDetails = () => new Promise((res) => setTimeout(res(userDetails)));

const userIdState = simpleStore(321);

const userDetailsStore = derivedStore(async (get) => {
    const response = await fetchUserDetails(get(userIdState));
    return await response.json();
});

expect(userDetailsStore.isAsync()).toBeTruthy();

try {
    userDetailsStore.getResult();
} catch (reason) {
    expect(reason instanceof Promise).toBeTruthy();
}

userDetailsStore.getState().then(() => {
    expect(userDetailsStore.getResult()).toBe(userDetails);
});
```

### Hooks

#### Description:

all hooks could be looked as primitive `useState` hook with customisation of returned data pair based on the hook's specific (only value/ ony setter / or both)

#### Details:

-   useLinkedStoreValue: `<T>(store: IStore<T>): LinkedStoreState<T>`

##### Usage:

Returns state and triggers Component re-render each time state it's changed.

```javascript
import { useLinkedStoreValue } from 'linked-store';

const ReactComponent = () => {
    const { state: isDirty} = useLinkedStoreValue(dirtyState);
    return isDirty ? null : <Content />;
};

const ReactComponent = () => {
    const { getState } = useLinkedStoreValue(dirtyState);
    return getState() ? null : <Content />;
};
```

-   useSetLinkedStore: `<T>(store: IStore<T>): SetState<T>`

##### Usage:

Returns state setter and never triggers component re-render.

```javascript
import { useSetLinkedStore } from 'linked-store';

const ReactComponent = () => {
    const setDirty = useSetLinkedStore(dirtyState);
    return <button onClick={() => setDirty(isDirty) => !isDirty)}>toggle dirty status</button>;
}
```

-   useResetLinkedStore: `<T>(store: IStore<T>): () => void`;

##### Usage:

Returns state reset method and never triggers component re-render.

```javascript
import { useResetLinkedStore } from 'linked-store';

const ReactComponent = () => {
    const resetState = useResetLinkedStore(dirtyState);
    return <button onClick={resetState}>Reset state</button>;
};
```

-   useLinkedStore: `<T>(state: IStore<T>): [LinkedStoreState<T>, (state: T) => void]`

##### Usage:

Returns pair of store values: state and its setter and triggers Component re-render each time state it's changed.

```javascript
import { useLinkedStore } from 'linked-store';

const ReactComponent = () => {
    const [{ store: isDirty }, setState] = useLinkedStore(dirtyState);
    return (
        <>
            <button onClick={() => setState(!isDirty)}>toggle dirty sate</button>
            {isDirty ? null : <Content />}
        </>
    );
};
```

## Advanced usage

### Description:

The state supports experimental concurrent mode.
In case if derived state is `Promise` the usage of the hooks will be the same. All need to do is to wrap such component to `Suspense`.

##### Usage:

```javascript
import {
    simpleStore,
    derivedStore,
    useLinkedStore,
    useLinkedStoreValue,
    useSetLinkedStore,
    useResetLinkedStore,
    useAsyncLinkedStoreValue,
} from 'linked-store';

const getUserDetails = (userId) => ({ name: `${userId === 123 ? 'first' : 'second'} user name` });
const fetchUserDetails = (userId) =>
    new Promise((res) => setTimeout(() => res(getUserDetails(userId)), 1000));

const dirtyStore = simpleStore(false)
const userIdStore = simpleStore(null);
const userDetailsStore = derivedStore(async (get) => await fetchUserDetails(get(userIdStore)));

const UserDetails = () => {
    const { name } = useAsyncLinkedStoreValue(userDetailsStore);
    const resetToAllUsers = useResetLinkedStore(userIdStore);

    return (
        <>
            <span>{name}</span>
            <button onClick={resetToAllUsers}>return to all users</button>
        </>
    );
};

const AllUsers = () => {
    const setUser = useSetLinkedStore(userIdStore);
    return (
        <ul>
            <li onClick={() => setUser(123)}>first user</li>
            <li onClick={() => setUser(321)}>second user</li>
        </ul>
    );
};

const ReactComponent = () => {
    const {getState} = useLinkedStoreValue(userIdStore);
    const hasSelectedUsers = getState();

    return (
        <Suspense fallback={<span>loading</span>}>
            {hasSelectedUsers ? <UserDetails /> : <AllUsers />}
        </Suspense>
    );
};
```
