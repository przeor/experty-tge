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

  address contractManager;
  address ethMultisigContract;
  address exyMultisigContract;

  // set basic info in constructor
  function ExpertyToken() public {
    name = 'Experty Token';
    symbol = 'EXY';
    decimals = 18;
    totalSupply = 0;
    circulatingSupply = 0;

    // manager who will be adding presale contributions
    contractManager = 0x123;

    // withdraw of ether tokens can be done only by multisignature wallet
    ethMultisigContract = 0x123;
    exyMultisigContract = 0x123;
  }

  // this function allows to withdraw ETH using
  // special multisig contract
  function withdraw(address addr, uint256 amount) public onlyEthMultisig {
    addr.transfer(amount);
  }

  // Modifiers:

  // only manager can call this
  modifier onlyManager() {
    require(msg.sender == contractManager);
    _;
  }

  // only multisig contract can call this
  modifier onlyEthMultisig() {
    require(tx.origin == ethMultisigContract);
    _;
  }

  // only multisig contract can call this
  modifier onlyExyMultisig() {
    require(tx.origin == exyMultisigContract);
    _;
  }
}

