pragma solidity ^0.4.11;


import 'zeppelin/contracts/token/MintableToken.sol';


contract AlisToken is MintableToken {

  string public constant name = 'AlisToken';

  string public constant symbol = 'ALIS';

  uint public constant decimals = 18;

  // TODO:
  //  address public multisig;

  function AlisToken(
  )
  MintableToken()
  {
  }
}
