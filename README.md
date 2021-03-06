# linked-store ![Status](https://travis-ci.org/eLeontev/linked-store.svg?branch=master) [![Coverage Status](https://coveralls.io/repos/github/eLeontev/linked-store/badge.svg?branch=master)](https://coveralls.io/github/eLeontev/linked-store?branch=master)

## Description

tiny state-management library inspired by recoil

## Installation

```shell script
npm install --save linked-store
```

## API

### Stores

-   simpleStore: `<T>(store: T): IStore<T>`

##### Usage:

```javascript
import { simpleStore } from 'linked-store';

const dirtyStore = simpleStore(false);

dirtyStore.setState(true);
expect(dirtyStore.getState()).toBeTruthy();

dirtyStore.resetState();
expect(dirtyStore.getState()).toBeFalsy();

dirtyStore.setState((state) => !state);
expect(dirtyStore.getState()).toBeTruthy();
```

-   derivedStore: `<T>(getter: (get: GetState) => T): IDerivedStore<T>`

##### Usage:

```javascript
// trivial usage
import { simpleStore, derivedStore } from 'linked-store';

const incrementStore = simpleStore(0);

const incrementX4Store = derivedStore((get) => get(incrementStore) * 4);

incrementStore.setState(1);
expect(incrementX4Store.getState()).toBe(4);

incrementStore.setState((state) => state + 1);
expect(incrementX4Store.getState()).toBe(8);
```

```javascript
// async usage
import { simpleStore, derivedStore } from 'linked-store';

const userDetails = { name: 'userName' };
const fetchUserDetails = () => new Promise((res) => setTimeout(() => res(userDetails)));

const userIdStore = simpleStore(321);

const userDetailsStore = derivedStore(async (get) => fetchUserDetails(get(userIdStore)));

expect(userDetailsStore.isAsync()).toBeTruthy();
expect(userDetailsStore.getState() instanceof Promise).toBeTruthy();

userDetailsStore.getState().then((userDetailsAsResource) => {
    expect(userDetailsAsResource).toBe(userDetails);
    expect(userDetailsStore.getResource()).toBe(userDetails);
});
```

##### Note: 
`setState` for `derivedStore` will only trigger current `getter`. Passing any arguments will not affect the state.
Call of `setState` will need only if store's `getter` contains side effects (e.g. fetch/localStorage, etc.)

```javascript
const sStore = simpleStore(3)
const dStore = derivedStore((get) => 2 * get(sStore));
store.setState();
expect(store.getState()).toBe(6);

store.setState(20);
expect(store.getState()).toBe(6);
```

#### Utils

-   getAsyncResource: `<T>(store: IDerivedStore<T>): GetStateCallback<Resource<T>>`

##### Description:

try to return async state resource and throw error in each request till promise will be resolved

| Phase    | Returned value        |
| -------- | --------------------- |
| pending  | `throw promise`       |
| error    | `throw rejectedError` |
| resolved | `return resource`     |

##### Usage:

```javascript
import { simpleStore, derivedStore, getAsyncResource } from 'linked-store';

const userDetails = { name: 'userName' };
const fetchUserDetails = () => new Promise((res) => setTimeout(() => res(userDetails)));

const userIdStore = simpleStore(321);

const userDetailsStore = derivedStore(async (get) => fetchUserDetails(get(userIdStore)));

const getAsyncState = getAsyncResource(userDetailsStore);

expect(getAsyncState instanceof Function).toBeTruthy();

try {
    getAsyncState();
} catch (reason) {
    expect(reason).toBe(userDetailsStore.getState());
    expect(reason instanceof Promise).toBeTruthy();
}

userDetailsStore.getState().then(() => {
    expect(getAsyncState()).toBe(userDetails);
});
```

## Hooks

#### Description:

all hooks could be looked as primitive `useState` hook with customisation of returned data pair based on the hook's specific (only value/ ony setter / or both)

#### Details:

| hook                | types                                                                    | raise re-render | description                                                                                                       |
| ------------------- | ------------------------------------------------------------------------ | --------------- | ----------------------------------------------------------------------------------------------------------------- |
| useLinkedStoreValue | `<T>(store: IStore<T>): [State<T>, GetStateHookCallback<T>]`              | `true`          | Returns state and triggers Component re-render each time state it's changed.                                      |
| useSetLinkedStore   | `<T>(store: IStore<T>): SetState<T>`                                      | `false`         | Returns state setter and never triggers component re-render.                                                      |
| useResetLinkedStore | `<T>(store: IStore<T>): () => void`                                       | `false`         | Returns state reset method and never triggers component re-render.                                                |
| useLinkedStore      | `<T>(store: IStore<T>): [State<T>, SetState<T>, GetStateHookCallback<T>]` | `true`          | Returns pair of store values: state and its setter and triggers Component re-render each time state it's changed. |

##### Usage:

```jsx
import {
    simpleStore,
    useLinkedStoreValue,
    useSetLinkedStore,
    useResetLinkedStore,
    useLinkedStore,
} from 'linked-store';

const dirtyStore = simpleStore(false);

const ToggleDirty1 = () => {
    const toggleDirty = useSetLinkedStore(dirtyStore);
    return <button onClick={() => toggleDirty((state) => !state)}>toggle dirty</button>;
};
const ToggleDirty2 = ({ isDirty }) => {
    const toggleDirty = useSetLinkedStore(dirtyStore);
    return <button onClick={() => toggleDirty(!isDirty)}>toggle dirty</button>;
};

const ResetStateComponent = () => {
    const resetState = useResetLinkedStore(dirtyStore);
    return <button onClick={resetState}>Reset dirty</button>;
};

const ToggleAndDisplay1 = () => {
    const [isDirty, toggleDirty] = useLinkedStore(dirtyStore);
    return (
        <button onClick={() => toggleDirty(!isDirty)}>
            current state: {isDirty ? 'dirty' : 'not dirty'}
        </button>
    );
};
const ToggleAndDisplay2 = () => {
    const [, toggleDirty, getDirtyState] = useLinkedStore(dirtyStore);
    return (
        <button onClick={() => toggleDirty(!getDirtyState())}>
            current state: {getDirtyState() ? 'dirty' : 'not dirty'}
        </button>
    );
};
const ToggleAndDisplay3 = () => {
    const [isDirty, toggleDirty] = useLinkedStore(dirtyStore);
    return (
        <button onClick={() => toggleDirty((isDirty) => !isDirty)}>
            current state: {isDirty ? 'dirty' : 'not dirty'}
        </button>
    );
};

const Component1 = () => {
    const [isDirty] = useLinkedStoreValue(dirtyStore);
    return isDirty ? null : <span>dirty details</span>;
};
const Component2 = () => {
    const [, getState] = useLinkedStoreValue(dirtyStore);
    return getState() ? null : <span>dirty details</span>;
};
```

## Advanced usage

### Description:

The derived stores supports async states like `Promise`. To integrate with react they could be used in different ways include experimental concurrent mode.

##### Usage:

##### without experimental concurrent mode

```jsx
import { derivedStore, useLinkedStore } from 'linked-store';

const asyncRandomStore = derivedStore(
    () => new Promise((res) => setTimeout(() => res(Math.random()), 1000))
);
const AsyncStoreComponent = () => {
    const [isLoaded, toggleLoaded] = useState(false);
    const [randomValue, setValue] = useState(null);

    const [randomValuePromise, updateState] = useLinkedStore(asyncRandomStore);

    useEffect(() => {
        toggleLoaded(false);
        randomValuePromise
            .then((randomValue) => setValue(randomValue))
            .catch(console.error)
            .finally(() => toggleLoaded(true));
    }, [randomValuePromise, toggleLoaded, setValue]);

    return isLoaded ? (
        <button onClick={() => updateState()}>{randomValue}</button>
    ) : (
        <span>loading...</span>
    );
};

// or 
const AsyncStoreComponent = () => {
    const { error, isLoading, data } = useAsyncWithLoaderLinkedStore(asyncRandomStore);
    return isLoading ? <span>loading...</span> : <Content content={data} />;
};
```

##### with experimental concurrent mode

```jsx
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

const dirtyStore = simpleStore(false);
const userIdStore = simpleStore(null);
const userDetailsStore = derivedStore(async (get) => await fetchUserDetails(get(userIdStore)));
const asyncRandomStore = derivedStore(
    () => new Promise((res) => setTimeout(() => res(Math.random()), 1000))
);

const UserDetails = () => {
    const details = useAsyncLinkedStoreValue(userDetailsStore);
    const resetToAllUsers = useResetLinkedStore(userIdStore);

    return (
        <>
            <span>{details.name}</span>
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

const AsyncStoreComponent = ({ getStateValue }) => {
    const updateState = useSetLinkedStore(asyncRandomStore);
    const randomValue = getStateValue();

    return <button onClick={() => updateState()}>{randomValue}</button>;
};

const App = () => {
    const [hasSelectedUsers] = useLinkedStoreValue(userIdStore);
    const [, getAsyncStateValue] = useLinkedStoreValue(asyncRandomStore);

    return (
        <>
            <Suspense fallback={<span>loading</span>}>
                {hasSelectedUsers ? <UserDetails /> : <AllUsers />}
            </Suspense>
            <Suspense fallback={<span>loading</span>}>
                <AsyncStoreComponent getStateValue={getAsyncStateValue} />
            </Suspense>
        </>
    );
};
```

## Usage with VanillaJS

### Description:

The store could be integrated or used with any framework you prefer, below is the demonstration of usage with pure javascript

##### Usage:

```javascript
import { derivedStore } from 'linked-store';

const asyncRandomStore = derivedStore(
    () => new Promise((res) => setTimeout(() => res(Math.random()), 1000))
);

class RandomRenderer {
    constructor(rootId, asyncSore) {
        this.rootElement = document.getElementById(rootId);
        this.asyncSore = asyncSore;

        this.updateInnerHTML = this.updateInnerHTML.bind(this);
        this.render = this.render.bind(this);

        this.registerTrigger();
    }

    render() {
        this.performCleanupAndCallRenderrer('loading');
        this.asyncSore.getState().then(this.updateInnerHTML);
    }

    updateInnerHTML(innerHTML) {
        this.rootElement.innerHTML = '';
        this.rootElement.innerHTML = innerHTML;
    }

    registerTrigger() {
        this.asyncSore.setTrigger(this.render);
    }

    destroy() {
        this.asyncSore.removeTrigger(this.render);
    }
}

const randomRenderer = new RandomRenderer('root', asyncRandomStore);
randomRenderer.render();

let iterator = 0;
let timerId = setInterval(() => {
    iterator += 1;

    asyncRandomStore.setState();

    if (iterator === 3) {
        randomRenderer.destroy();
        clearInterval(timerId);
    }
}, 2000);
```
