const AlisToken = artifacts.require('AlisToken.sol');

contract('AlisToken', (accounts) => {
  let token;

  beforeEach(async () => {
    token = await AlisToken.new();
  });

  it('should start with a totalSupply of 0 when deployed alone', async () => {
    const totalSupply = await token.totalSupply();

    assert.equal(totalSupply, 0);
  });

  it('should return mintingFinished false after construction', async () => {
    const mintingFinished = await token.mintingFinished();

    assert.equal(mintingFinished, false);
  });

  it('should mint a given amount of tokens to a given address', async () => {
    await token.mint(accounts[0], 100);

    const balance0 = await token.balanceOf(accounts[0]);
    assert(balance0, 100);

    const totalSupply = await token.totalSupply();
    assert(totalSupply, 100);
  });
});
