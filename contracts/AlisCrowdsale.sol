pragma solidity ^0.4.13;


import 'zeppelin/contracts/crowdsale/CappedCrowdsale.sol';
import 'zeppelin/contracts/crowdsale/RefundableCrowdsale.sol';
import 'zeppelin/contracts/token/MintableToken.sol';
import './WhitelistedCrowdsale.sol';
import './AlisToken.sol';


/**
 * The Crowdsale contract of ALIS project.
*/
contract AlisCrowdsale is CappedCrowdsale, RefundableCrowdsale, WhitelistedCrowdsale {

  // ICO start date time. 1 Sep 2017 2:00(UTC)
  // Could not add to Crowdsale.json because of EVM said stack too deep.
  uint256 constant ICO_START_TIME = 1504231200;

  // FIXME:
  uint256 public tokenCap = 500000000 ether;

  /*
  * Token exchange rates of ETH and ALIS.
  */
  uint256 public ratePreSale;
  uint256 public rateWeek1;
  uint256 public rateWeek2;
  uint256 public rateWeek3;

  function AlisCrowdsale(
  uint256 _startBlock,
  uint256 _endBlock,
  uint256 _baseRate,
  address _wallet,
  uint256 _cap,
  uint256 _initialAlisFundBalance,
  uint256 _goal,
  uint256 _ratePreSale,
  uint256 _rateWeek1,
  uint256 _rateWeek2,
  uint256 _rateWeek3,
  address[] _whiteList
  )
  Crowdsale(_startBlock, _endBlock, _baseRate, _wallet)
  CappedCrowdsale(_cap)
  RefundableCrowdsale(_goal)
  WhitelistedCrowdsale(_whiteList)
  {
    ratePreSale = _ratePreSale;
    rateWeek1 = _rateWeek1;
    rateWeek2 = _rateWeek2;
    rateWeek3 = _rateWeek3;

    token.mint(wallet, _initialAlisFundBalance);
  }

  // overriding Crowdsale#createTokenContract to change token to AlisToken.
  function createTokenContract() internal returns (MintableToken) {
    return new AlisToken();
  }

  // overriding CappedCrowdsale#validPurchase to add extra token cap logic
  // @return true if investors can buy at the moment
  function validPurchase() internal constant returns (bool) {
    bool withinCap = token.totalSupply().add(msg.value.mul(getRate())) <= tokenCap;
    return super.validPurchase() && withinCap;
  }

  // overriding Crowdsale#hasEnded to add cap logic
  // @return true if crowdsale event has ended
  function hasEnded() public constant returns (bool) {
    bool capReached = token.totalSupply() >= tokenCap;
    return super.hasEnded() || capReached;
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

    if (now <= ICO_START_TIME) {
      // before 2017/09/01 02:00 UTC
      currentRate = ratePreSale;
    } else if (now <= ICO_START_TIME.add(1 weeks)) {
      // before 2017/09/08 02:00 UTC
      currentRate = rateWeek1;
    } else if (now <= ICO_START_TIME.add(2 weeks)) {
      // before 2017/09/15 02:00 UTC
      currentRate = rateWeek2;
    } else if (now <= ICO_START_TIME.add(3 weeks)) {
      // before 2017/09/21 02:00 UTC
      currentRate = rateWeek3;
    }

    return currentRate;
  }

  // @return true if crowd sale is accepting.
  function saleAccepting() internal constant returns (bool) {
    return !isPresale() || isWhiteListMember(msg.sender);
  }

  // @return true if crowd sale is pre sale.
  function isPresale() internal constant returns (bool) {
    return now <= ICO_START_TIME;
  }
}
