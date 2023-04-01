module.exports = {
    roots: [
        '<rootDir>/src'
    ],
    collectCoverage: true,
    coverageDirectory: `<rootDir>/.jest/coverage`,
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
}
