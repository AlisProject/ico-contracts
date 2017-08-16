pragma solidity ^0.4.13;


import 'zeppelin/contracts/crowdsale/Crowdsale.sol';


/**
 * @title WhitelistedCrowdsale
 * @dev Extension of Crowdsale with the whitelist of specific members.
 */
contract WhitelistedCrowdsale is Crowdsale {
  mapping (address => bool) public whiteList;

  function WhitelistedCrowdsale(address[] _whiteList) {
    for (uint i = 0; i < _whiteList.length; i++) {
      whiteList[_whiteList[i]] = true;
    }
  }

  // @return true if address is whitelisted member.
  function isWhiteListMember(address _member) constant returns (bool) {
    return whiteList[_member] == true;
  }
}
