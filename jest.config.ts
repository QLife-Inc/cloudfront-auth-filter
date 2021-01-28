export default {
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.[jt]s'],
  moduleFileExtensions: ['js', 'ts'],
  transform: { '^.+\\.ts$': 'ts-jest' },
  collectCoverage: true,
  collectCoverageFrom: ['**/src/**'],
  coveragePathIgnorePatterns: ['/node_modules/', '/__tests__/'],
}
