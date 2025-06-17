export default {
  transform: {
    "^.+\\.jsx?$": [
      "babel-jest",
      { configFile: "./config/babel-jest.config.js" }
    ]
  },
  testEnvironment: "node"
};
