pragma solidity ^0.4.11;


import 'zeppelin/contracts/crowdsale/Crowdsale.sol';
import 'zeppelin/contracts/token/MintableToken.sol';
import './AlisToken.sol';


/**
 * THe Crowdsale contract of ALIS project.
*/
contract AlisCrowdsale is Crowdsale {

  function AlisCrowdsale(uint256 start, uint256 end, uint _rate, address _fundAddress)
  Crowdsale(start, end, _rate, _fundAddress)
  {
//    token = AlisToken(_AlisTokenAddress);
    token = createTokenContract();
  }

  function createTokenContract() internal returns (MintableToken) {
    return new AlisToken();
  }

  // send ether to the fund collection wallet
  // override to create custom fund forwarding mechanisms
  function forwardFunds() internal {
    wallet.transfer(msg.value);
  }
}
