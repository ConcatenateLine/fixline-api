import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig.json';

export default {
  preset: 'ts-jest',
  rootDir: './',
  testEnvironment: 'node',
  testRegex: '.*\\.spec\\.ts$',
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  moduleNameMapper: pathsToModuleNameMapper(
    { ...compilerOptions.paths, 'test/*': ['test/*'] },
    {
      prefix: '<rootDir>/',
    },
  ),
  setupFilesAfterEnv: ['<rootDir>/test/singleton.ts'],
};
