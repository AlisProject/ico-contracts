/* global it */
const AlisToken = artifacts.require('AlisToken.sol');

contract('AlisToken', (accounts) => {
  let alisToken; // Deployed AlisToken.

  describe('CONTRACT DEPLOYMENT', () => {
    it('should put 500,000,000 AlisToken in the first account', () => AlisToken.deployed().then(
      (instance) => {
        alisToken = instance;
        return instance.balanceOf.call(accounts[0]);
      },
    ).then(
      (balance) => {
        assert.equal(balance.valueOf() / (10 ** 18), 500000000, `wrong token amount: ${balance.valueOf()}`);
      }),
    );

    it('should put 250,000,000 amount in the offeredAmount property.', () => alisToken.offeredAmount().then(
      amount => (
        assert.equal(amount.valueOf() / (10 ** 18), 250000000)
      )),
    );
  });
});
