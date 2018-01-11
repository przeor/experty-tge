pragma solidity ^0.4.11;

/**
 * Math operations with safety checks
 */
library SafeMath {
  function sub(uint a, uint b) pure internal returns (uint) {
    assert(b <= a);
    return a - b;
  }

  function add(uint a, uint b) pure internal returns (uint) {
    uint c = a + b;
    assert(c >= a);
    return c;
  }
}

 /*
 * Contract that is working with ERC223 tokens
 */
contract ERC223ReceivingContract {
  function tokenFallback(address _from, uint _value, bytes _data) public;
}


contract ERC223Token {
  using SafeMath for uint;

  // token constants
  string public name;
  string public symbol;
  uint8 public decimals;
  uint256 public totalSupply;

  // token balances
  mapping(address => uint256) public balanceOf;

  // Function that is called when a user or another contract wants to transfer funds .
  function transfer(address to, uint value, bytes data) public {
    // Standard function transfer similar to ERC20 transfer with no _data .
    // Added due to backwards compatibility reasons .
    uint codeLength;

    assembly {
      // Retrieve the size of the code on target address, this needs assembly .
      codeLength := extcodesize(to)
    }

    balanceOf[msg.sender] = balanceOf[msg.sender].sub(value);
    balanceOf[to] = balanceOf[to].add(value);
    if (codeLength > 0) {
      ERC223ReceivingContract receiver = ERC223ReceivingContract(to);
      receiver.tokenFallback(msg.sender, value, data);
    }
    Transfer(msg.sender, to, value, data);
  }

  // Standard function transfer similar to ERC20 transfer with no _data .
  // Added due to backwards compatibility reasons .
  function transfer(address to, uint value) public {
    uint codeLength;

    assembly {
      // Retrieve the size of the code on target address, this needs assembly .
      codeLength := extcodesize(to)
    }

    balanceOf[msg.sender] = balanceOf[msg.sender].sub(value);
    balanceOf[to] = balanceOf[to].add(value);
    if (codeLength > 0) {
      ERC223ReceivingContract receiver = ERC223ReceivingContract(to);
      bytes memory empty;
      receiver.tokenFallback(msg.sender, value, empty);
    }
    Transfer(msg.sender, to, value, empty);
  }

  event Transfer(address indexed from, address indexed to, uint value, bytes indexed data);
}


contract ExpertyToken is ERC223Token {
  uint256 public circulatingSupply;


  // set basic info in constructor
  function ExpertyToken() public {
    name = 'Experty Token';
    symbol = 'EXY';
    decimals = 18;
    totalSupply = 0;
    circulatingSupply = 0;

    // // seed contributions are hardcoded here
    // // presale contributions will be added after contract deploy
    // uint256 seedRate = standardRate + seedBonus;
    // contributions[0x37Fe339B8b46463489222654b0100db03D7cB19e] = seedRate * 403389017000000000;
    // contributions[0xCf83184B69fc79D46De78A9a2221F8B11dd70698] = seedRate * 140000000000000000;
    // contributions[0x081aF29ee22c5B902BC6e9c3CE7FA9DE77ce8266] = seedRate * 2500000000000000000000;
    // increaseTotalSupply(contributions[0x37Fe339B8b46463489222654b0100db03D7cB19e]);
    // increaseTotalSupply(contributions[0xCf83184B69fc79D46De78A9a2221F8B11dd70698]);
    // increaseTotalSupply(contributions[0x081aF29ee22c5B902BC6e9c3CE7FA9DE77ce8266]);

    // // manager who will be adding presale contributions
    // contractManager = 0x123;

    // // withdraw of ether tokens can be done only by multisignature wallet
    // ethMultisigContract = 0x123;
    // exyMultisigContract = 0x123;

    // // presale contract address
    // presaleContract = 0x123;
  }

}

