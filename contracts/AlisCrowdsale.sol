pragma solidity ^0.4.11;


import 'zeppelin/contracts/crowdsale/Crowdsale.sol';
import './AlisToken.sol';


/**
 * THe Crowdsale contract of ALIS project.
*/
contract AlisCrowdsale is Crowdsale {

  AlisToken public token;  // ALIS Token contract.
  address public fund; // The fund of ALIS project.
  uint256 public offeredAmount; // Amount of AlisTokens offered to the public.
  uint public rate; // Rate of ETH to ALIS.

  function AlisCrowdsale(address _fundAddress, uint256 _offeredAmount, uint _rate)
  Crowdsale(0, 10000, _rate, _fundAddress)
  {
//    token = AlisToken(_AlisTokenAddress);
    fund = _fundAddress;
    offeredAmount = _offeredAmount;
    rate = _rate;
  }

  function createTokenContract() internal returns (MintableToken) {
    return new AlisToken();
  }
}
