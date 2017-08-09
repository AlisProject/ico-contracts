pragma solidity ^0.4.13;


import './lib/MultiSigWallet.sol';


/**
 * The Multisignature wallet contract of ALIS project.
*/
contract AlisFund is MultiSigWallet {

  function AlisFund(address[] _owners, uint _required)
  public
  validRequirement(_owners.length, _required)
  MultiSigWallet(_owners, _required)
  {
  }
}
