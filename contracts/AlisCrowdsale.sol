pragma solidity ^0.4.11;


import 'zeppelin/contracts/crowdsale/CappedCrowdsale.sol';
import 'zeppelin/contracts/token/MintableToken.sol';
import './AlisToken.sol';


/**
 * THe Crowdsale contract of ALIS project.
*/
contract AlisCrowdsale is CappedCrowdsale {

  function AlisCrowdsale(uint256 _startBlock, uint256 _endBlock, uint256 _rate, address _wallet, uint256 _cap)
  Crowdsale(_startBlock, _endBlock, _rate, _wallet)
  CappedCrowdsale(_cap)
  {
  }

  function createTokenContract() internal returns (MintableToken) {
    return new AlisToken();
  }
}
