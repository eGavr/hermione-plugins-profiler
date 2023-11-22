module.exports = {
  preset: 'ts-jest',
  verbose: true,
  testMatch: [
    "**/src/**/*.spec.ts"
  ],
  setupFilesAfterEnv: ["jest-extended/all"]
};
