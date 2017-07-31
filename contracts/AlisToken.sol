pragma solidity ^0.4.11;


import 'zeppelin/contracts/token/MintableToken.sol';


contract AlisToken is MintableToken {

  string public name = 'AlisToken';

  string public symbol = 'ALIS';

  uint public decimals = 18;

  //  address public multisig;

  function AlisToken(
  )
  MintableToken()
  {
  }
}
