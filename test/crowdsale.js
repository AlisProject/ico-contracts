/* global it */
const AlisToken = artifacts.require('AlisToken.sol');
const Crowdsale = artifacts.require('Crowdsale.sol');

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

    it('should has exchange rate 2,080 of ETH to ALIS', () => crowdSale.rate().then(
      (rate) => {
        assert.equal(rate, 2080, `wrong fund address: ${rate}`);
      },
    ));
  });
});
