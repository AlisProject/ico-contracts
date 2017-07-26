/* global it */
const AlisToken = artifacts.require('AlisToken.sol');
const Crowdsale = artifacts.require('Crowdsale.sol');

// FIXME
function toIntOfToken(value, decimal) {
  return value / (10 ** decimal);
}

contract('Crowdsale', () => {
  let crowdSale; // Deployed CrowdSale.

  describe('CONTRACT DEPLOYMENT', () => {
    it('should has deployed address of AlisToken', () => Crowdsale.deployed().then(
      (instance) => {
        crowdSale = instance;

        return crowdSale.token().then(
          (tokenAddress) => {
            assert.equal(AlisToken.address, tokenAddress, `wrong token address: ${tokenAddress}`);
          },
        );
      },
    ));

    it('should has specified address of AlisFund', () => crowdSale.fund().then(
      (fund) => {
        assert.equal(fund, '0x0000000000000000000000000000000000000000', `wrong fund address: ${fund}`);
      },
    ));

    it('should has offered ALIS Token amount 250,000,000', () => crowdSale.offeredAmount().then(
      (offeredAmount) => {
        assert.equal(toIntOfToken(offeredAmount, 18), 250000000, `wrong amount: ${offeredAmount}`);
      },
    ));

    it('should has exchange rate 2,080 of ETH to ALIS', () => crowdSale.rate().then(
      (rate) => {
        assert.equal(rate, 2080, `wrong rate: ${rate}`);
      },
    ));
  });
});
