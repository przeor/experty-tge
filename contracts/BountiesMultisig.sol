pragma solidity ^0.4.4;

import './ExpertyToken.sol';

// contract ERC223Token {
//   function transfer(address to, uint value) public;
// }

contract BountiesMultisig {

  // wallet
  struct Tx {
    address tokenAddress;
    address founder;
    address destAddr;
    uint256 amount;
    bool active;
  }
  mapping (address => bool) public founders;
  Tx[] public txs;

  // preTGE constructor
  function BountiesMultisig() public {
    founders[0xCE05A8Aa56E1054FAFC214788246707F5258c0Ae] = true;
    founders[0xBb62A710BDbEAF1d3AD417A222d1ab6eD08C37f5] = true;
    founders[0x009A55A3c16953A359484afD299ebdC444200EdB] = true;
  }

  function tokenFallback(address _from, uint _value, bytes _data) public {
  }

  // one of founders can propose destination address for ethers
  function proposeTx(address tokenAddress, address destAddr, uint256 amount) public isFounder {
    txs.push(Tx({
      tokenAddress: tokenAddress,
      founder: msg.sender,
      destAddr: destAddr,
      amount: amount,
      active: true
    }));
  }

  // another founder can approve specified tx and send it to destAddr
  function approveTx(uint8 txIdx) public isFounder {
    assert(txs[txIdx].founder != msg.sender);
    assert(txs[txIdx].active);

    txs[txIdx].active = false;

    ERC223Token token = ERC223Token(txs[txIdx].tokenAddress);
    token.transfer(txs[txIdx].destAddr, txs[txIdx].amount);
  }

  // founder who created tx can cancel it
  function cancelTx(uint8 txIdx) public {
    assert(txs[txIdx].founder == msg.sender);
    assert(txs[txIdx].active);

    txs[txIdx].active = false;
  }

  // check if msg.sender is founder
  modifier isFounder() {
    assert(founders[msg.sender]);
    _;
  }

}