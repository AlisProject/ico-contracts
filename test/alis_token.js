/* global it */
const AlisToken = artifacts.require('AlisToken.sol');

contract('AlisToken', (accounts) => {
  // noinspection Annotator
  it('should put 500,000,000 AlisToken in the first account', () => AlisToken.deployed().then(
    instance => (
      instance.balanceOf.call(accounts[0])
    ),
  ).then(
    (balance) => {
      assert.equal(balance.valueOf() / (10 ** 18), 500000000, `wrong token amount: ${balance.valueOf()}`);
    }),
  );
});
