const resource = 'resource';

export const getAsyncResource = jest
    .fn()
    .mockName('getAsyncResource')
    .mockReturnValue(() => resource);
