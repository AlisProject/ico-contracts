/* global it */
let AlisToken = artifacts.require('AlisToken.sol');
let AlisCrowdSale = artifacts.require('AlisCrowdSale.sol');

// FIXME
function toIntOfToken(value, decimal) {
  return value / (10 ** decimal);
}

contract('CrowdSale', () => {
  let crowdsale; // Deployed AlisCrowdSale.

  describe('CONTRACT DEPLOYMENT', () => {
    it('should has deployed address of AlisToken', () => AlisCrowdSale.deployed().then(
      (instance) => {
        crowdsale = instance;
        console.log(AlisToken.address);

        return crowdsale.token().then(
          (tokenAddress) => {
            assert.equal(AlisToken.address, tokenAddress, `wrong token address: ${tokenAddress}`);
          },
        );
      },
    ));

    it('should has specified address of AlisFund', () => crowdsale.fund().then(
      (fund) => {
        assert.equal(fund, '0x0000000000000000000000000000000000000000', `wrong fund address: ${fund}`);
      },
    ));

    it('should has offered ALIS Token amount 250,000,000', () => crowdsale.offeredAmount().then(
      (offeredAmount) => {
        assert.equal(toIntOfToken(offeredAmount, 18), 250000000, `wrong amount: ${offeredAmount}`);
      },
    ));

    it('should has exchange rate 2,080 of ETH to ALIS', () => crowdsale.rate().then(
      (rate) => {
        assert.equal(rate, 2080, `wrong rate: ${rate}`);
      },
    ));
  });
});
