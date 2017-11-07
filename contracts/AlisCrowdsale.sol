pragma solidity ^0.4.13;


import 'zeppelin/contracts/crowdsale/CappedCrowdsale.sol';
import 'zeppelin/contracts/crowdsale/RefundableCrowdsale.sol';
import 'zeppelin/contracts/token/MintableToken.sol';
import 'zeppelin/contracts/lifecycle/Pausable.sol';
import './WhitelistedCrowdsale.sol';
import './AlisToken.sol';


/**
 * The Crowdsale contract of ALIS project.
*/
contract AlisCrowdsale is CappedCrowdsale, RefundableCrowdsale, WhitelistedCrowdsale, Pausable {

  /*
  * Token exchange rates of ETH and ALIS.
  * Could not add to Crowdsale.json because of EVM said stack too deep.
  */
  uint256 constant RATE_PRE_SALE = 20000;
  uint256 constant RATE_WEEK_1 = 2900;
  uint256 constant RATE_WEEK_2 = 2600;
  uint256 constant RATE_WEEK_3 = 2300;

  // ICO start date time.
  uint256 public icoStartTime;

  // The cap amount of ALIS tokens.
  uint256 public tokenCap;

  function AlisCrowdsale(
  uint256 _startBlock,
  uint256 _icoStartTime,
  uint256 _endBlock,
  uint256 _baseRate,
  address _wallet,
  uint256 _cap,
  uint256 _tokenCap,
  uint256 _initialAlisFundBalance,
  uint256 _goal,
  address[] _whiteList
  )
  Crowdsale(_startBlock, _endBlock, _baseRate, _wallet)
  CappedCrowdsale(_cap)
  RefundableCrowdsale(_goal)
  WhitelistedCrowdsale(_whiteList)
  {
    icoStartTime = _icoStartTime;
    tokenCap = _tokenCap;

    token.mint(wallet, _initialAlisFundBalance);
  }

  // overriding Crowdsale#createTokenContract to change token to AlisToken.
  function createTokenContract() internal returns (MintableToken) {
    return new AlisToken();
  }

  // overriding CappedCrowdsale#validPurchase to add extra token cap logic
  // @return true if investors can buy at the moment
  function validPurchase() internal constant returns (bool) {
    bool withinTokenCap = token.totalSupply().add(msg.value.mul(getRate())) <= tokenCap;
    return super.validPurchase() && withinTokenCap;
  }

  // overriding CappedCrowdsale#hasEnded to add token cap logic
  // @return true if crowdsale event has ended
  function hasEnded() public constant returns (bool) {
    bool tokenCapReached = token.totalSupply() >= tokenCap;
    return super.hasEnded() || tokenCapReached;
  }

  // overriding RefundableCrowdsale#finalization
  // - To store remaining ALIS tokens.
  // - To minting unfinished because of our consensus algorithm.
  //   - https://alisproject.github.io/whitepaper/whitepaper_v1.01.pdf
  function finalization() internal {
    uint256 remaining = tokenCap.sub(token.totalSupply());

    if (remaining > 0) {
      token.mint(wallet, remaining);
    }

    // change AlisToken owner to AlisFund.
    token.transferOwnership(wallet);

    // From RefundableCrowdsale#finalization
    if (goalReached()) {
      vault.close();
    } else {
      vault.enableRefunds();
    }
  }

  // overriding Crowdsale#buyTokens to rate customizable.
  // This is created to compatible PR below:
  // - https://github.com/OpenZeppelin/zeppelin-solidity/pull/317
  function buyTokens(address beneficiary) payable {
    require(!paused);
    require(beneficiary != 0x0);
    require(validPurchase());
    require(saleAccepting());

    uint256 weiAmount = msg.value;

    // for presale
    if ( isPresale() ) {
      checkLimit(weiAmount);
    }

    // calculate token amount to be created
    uint256 tokens = weiAmount.mul(getRate());

    // update state
    weiRaised = weiRaised.add(weiAmount);

    token.mint(beneficiary, tokens);
    TokenPurchase(msg.sender, beneficiary, weiAmount, tokens);

    forwardFunds();
  }

  // Custom rate.
  //
  // This is created to compatible PR below:
  // - https://github.com/OpenZeppelin/zeppelin-solidity/pull/317
  function getRate() constant returns (uint256) {
    uint256 currentRate = rate;

    // We decided using `now` alias of `block.timestamp` instead `block.number`
    // Because of same reason:
    // - https://github.com/OpenZeppelin/zeppelin-solidity/issues/350
    if (isPresale()) {
      // before 2017/09/01 02:00 UTC
      currentRate = RATE_PRE_SALE;
    } else if (now <= icoStartTime.add(1 weeks)) {
      // before 2017/09/08 02:00 UTC
      currentRate = RATE_WEEK_1;
    } else if (now <= icoStartTime.add(2 weeks)) {
      // before 2017/09/15 02:00 UTC
      currentRate = RATE_WEEK_2;
    } else if (now <= icoStartTime.add(3 weeks)) {
      // before 2017/09/21 02:00 UTC
      currentRate = RATE_WEEK_3;
    }

    return currentRate;
  }

  // @return true if crowd sale is accepting.
  function saleAccepting() internal constant returns (bool) {
    return !isPresale() || isWhiteListMember(msg.sender);
  }

  // @return true if crowd sale is pre sale.
  function isPresale() internal constant returns (bool) {
    return now <= icoStartTime;
  }
}
