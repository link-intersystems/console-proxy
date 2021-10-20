/** @type {import('@ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  roots: ["<rootDir>/src"],
  modulePaths: ["src"],
  testEnvironment: "node",
  transform: { "^.+\\.(ts|tsx)$": "ts-jest" },
  testMatch: [
    "**/__tests__/**/{!(index.ts),.+(ts|tsx|js)}",
    "**/?(*.)+(spec|test).+(ts|tsx|js)",
  ],
};
