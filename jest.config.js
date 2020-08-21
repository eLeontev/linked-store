module.exports = {
    modulePaths: ['<rootDir>'],
    testMatch: ['**/tests/**/*.[jt]s?(x)'],
    collectCoverageFrom: ['src/**/*', '!src/models.ts', '!src/index.ts'],
    collectCoverage: true,
};
