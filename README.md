[![CircleCI](https://circleci.com/gh/AlisProject/contracts/tree/master.svg?style=svg)](https://circleci.com/gh/AlisProject/contracts/tree/master)  
  
# Contracts
![ALIS](https://alismedia.jp/img/logo.png)


The contracts of [ALIS project](https://alismedia.jp).  
Let me know at Slack channel if you have any questions.  
- https://alis-slack.herokuapp.com

# Solgraph
[Solgraph](https://github.com/raineorshine/solgraph) image of `AlisCrowdsale.sol`.  
![](./solgraph/AlisCrowdsale.png)

# Prerequisite 
- node.js
- yarn

# Usage

1. `git clone https://github.com/AlisProject/contracts.git`
1. `cd contracts`
1. `yarn`
1. `yarn truffle install`

# Test
- `yarn test:all`

## Run single test
- `yarn test ./test/alis_crowdsale.js`

# Debug
- `yarn debug`
    - You can use `debugger;` function of node.

# Deployment

## Private net & Test net
- `yarn deploy`

## Main net
- `truffle deploy --network live`

# License
- [GPL-3.0](https://www.gnu.org/licenses/gpl-3.0.txt)
