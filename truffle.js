require('babel-register');
require('babel-polyfill');

module.exports = {
  networks: {
    live: {
      network_id: 1,
      host: "localhost",
      port: 8545,
      gas: 4400000,
      gasPrice: 21000000000
    },
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*", // Match any network id
      gas: 3500000,
      gasPrice: 2100000000000
    },
    testrpc: {
      host: "localhost",
      port: 8545,
      network_id: "*", // Match any network id
      gas: 4400000,
      gasPrice: 2100000000000
    }
  }
};
