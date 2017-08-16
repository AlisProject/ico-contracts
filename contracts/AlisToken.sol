pragma solidity ^0.4.13;


import 'zeppelin/contracts/token/MintableToken.sol';
import './lib/BurnableToken.sol';


contract AlisToken is MintableToken, BurnableToken {

  string public constant name = 'AlisToken';

  string public constant symbol = 'ALIS';

  // same as ether. (1ether=1wei * (10 ** 18))
  uint public constant decimals = 18;
}
