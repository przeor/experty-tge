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

  // not claimed contributions
  mapping(address => uint256) public contributions;

  // all locked tokens for 18 months & vested for 36 months
  // will be saved here
  struct lockedContribution {
    uint exyPerPeriod;
    uint8 periods;
    uint8 claimedPeriods;
    uint8 periodDuration;
  }
  mapping(address => lockedContribution) public lockedContributions;

  // tokens can be claimed when total supply is locked
  bool locked = false;
  uint initTimestamp = 0;

  // set basic info in constructor
  function ExpertyToken() public {
    name = 'Experty Token';
    symbol = 'EXY';
    decimals = 18;
    totalSupply = 0;
    circulatingSupply = 0;

    contractManager = msg.sender;
  }

  function lockSupply() public onlyManager onlyUnlocked {
    locked = true;
    initTimestamp = block.timestamp;
  }

  function addContribution(address contributor, uint exyTokens) public onlyUnlocked {
    contributions[contributor] = exyTokens;
    totalSupply += exyTokens;
  }


  // allow menager to add all presale contributors before actual TGE
  function addPartnersAllocation(address addr, uint exyPerPeriod, uint8 periods, uint8 months) public onlyManager onlyUnlocked {
    lockedContributions[addr] = lockedContribution({
      exyPerPeriod: exyPerPeriod,
      periods: periods,
      claimedPeriods: 0,
      periodDuration: months
    });
    totalSupply += periods * exyPerPeriod;
  }

  // claim tokens from given address
  // tokens can be claimed only after supply is locked
  function claim(address addr) public onlyLocked {

    uint claimedAmount = 0;

    // if there was a standard contribution, send all tokens
    if (0 < contributions[addr]) {
      claimedAmount = contributions[addr];
      // clean balance before transfer
      contributions[addr] = 0;
    } else if (0 < lockedContributions[addr].periods) {
      // ignore claim after all periods were claimed
      require(lockedContributions[addr].claimedPeriods < lockedContributions[addr].periods);

      // lastPayout is a timestamp, it tells you what was period of your last payout
      // this is mostly used for company tokens which are vested for 3 years (please reference to the whitepaper)
      uint256 lastPayout = initTimestamp + (lockedContributions[addr].claimedPeriods + 1) * uint256(lockedContributions[addr].periodDuration) * 1 years / 12;

      // require lastPayout timestamp was before actual timestamp
      require(lastPayout < block.timestamp);

      // increase claimedPeriods counter
      lockedContributions[addr].claimedPeriods += 1;

      claimedAmount = lockedContributions[addr].exyPerPeriod;
    }

    mint(addr, claimedAmount);
  }

  // claim your tokens
  function claim() public {
    claim(msg.sender);
  }

  // this function allows to withdraw ETH using
  // special multisig contract
  function withdraw(address addr, uint256 amount) public onlyEthMultisig {
    // transfer ETH
    addr.transfer(amount);
  }

  // mint tokens
  function mint(address to, uint value) private {
    uint codeLength;

    assembly {
      // Retrieve the size of the code on target address, this needs assembly .
      codeLength := extcodesize(to)
    }

    circulatingSupply += value;

    balanceOf[to] = balanceOf[to].add(value);
    if (codeLength > 0) {
      ERC223ReceivingContract receiver = ERC223ReceivingContract(to);
      bytes memory empty;
      receiver.tokenFallback(msg.sender, value, empty);
    }
    Mint(to, value);
  }

  function initEthMultisigContract(address _ethMultisigContract) public onlyManager {
    require(ethMultisigContract == 0x0);
    ethMultisigContract = _ethMultisigContract;
  }

  function initExyMultisigContract(address _exyMultisigContract) public onlyManager {
    require(exyMultisigContract == 0x0);
    exyMultisigContract = _exyMultisigContract;
  }

  // Modifiers:

  // only manager can call this
  modifier onlyManager() {
    require(msg.sender == contractManager);
    _;
  }

  // can be called only when token supply is locked
  modifier onlyLocked() {
    require(locked);
    _;
  }

  // can be called only when token supply is unlocked
  modifier onlyUnlocked() {
    require(!locked);
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

  event Mint(address indexed to, uint value);
}

