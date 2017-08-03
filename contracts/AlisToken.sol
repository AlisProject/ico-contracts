pragma solidity ^0.4.11;


import 'zeppelin/contracts/token/MintableToken.sol';


contract AlisToken is MintableToken {

  string public constant name = 'AlisToken';

  string public constant symbol = 'ALIS';

  // same as ether. (1ether=1wei * (10 ** 18))
  uint public constant decimals = 18;
}
