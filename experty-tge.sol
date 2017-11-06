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


contract ExpertyToken {
  using SafeMath for uint;

  // token constants
  string public name;
  string public symbol;
  uint8 public decimals;
  uint256 public totalSupply;
  uint256 public circulatingSupply;

  // TGE
  uint256 standardRate = 1000;
  uint256 seedBonus = 700;
  // address presaleAddr = 0x123;
  uint256 public tgeStart = 1513378816; // 16 december 0:00
  uint256 tgeDuration = 4 weeks;
  uint256 public tgeEnd = tgeStart + tgeDuration;
  address contractManager;

  // tokens distribution summary in percents
  uint256 public crowdsaleTokens = 33;
  uint256 public companyTokens = 33;
  uint256 public partnerTokens = 30;
  uint256 public airdropsTokens = 3;
  uint256 public salecostsTokens = 1;
  uint256 public allTokens = crowdsaleTokens + companyTokens + partnerTokens + airdropsTokens + salecostsTokens;

  // all locked tokens for 18 months & vested for 36 months
  // will be saved here
  struct lockedContribution {
    uint256 fractionEXY;
    uint8 periods;
    uint8 claimedPeriods;
    uint8 periodDuration;
  }
  mapping(address => lockedContribution) public lockedContributions;


  mapping(address => uint256) public balanceOf;
  mapping(address => uint256) public contributions;


  // set basic info in constructor
  function ExpertyToken() public {
    name = 'Experty Token';
    symbol = 'EXY';
    decimals = 18;
    totalSupply = 0;
    circulatingSupply = 0;

    // seed contributions are hardcoded here
    // presale contributions will be added after contract deploy
    uint256 seedRate = standardRate + seedBonus;
    contributions[0x37Fe339B8b46463489222654b0100db03D7cB19e] = seedRate * 403389017000000000;
    contributions[0xCf83184B69fc79D46De78A9a2221F8B11dd70698] = seedRate * 140000000000000000;
    contributions[0x081aF29ee22c5B902BC6e9c3CE7FA9DE77ce8266] = seedRate * 2500000000000000000000;
    IncreaseTotalSupply(contributions[0x37Fe339B8b46463489222654b0100db03D7cB19e]);
    IncreaseTotalSupply(contributions[0xCf83184B69fc79D46De78A9a2221F8B11dd70698]);
    IncreaseTotalSupply(contributions[0x081aF29ee22c5B902BC6e9c3CE7FA9DE77ce8266]);

    // manager who will be adding presale contributions
    contractManager = 0x123;
  }

  function IncreaseTotalSupply(uint256 generatedTokens) internal {
    totalSupply += generatedTokens * allTokens / crowdsaleTokens;
  }

  // function for other contributions
  // function() public payable {
  // }

  // function tokenFallback() public {

  // }


  // allow menager to add all presale contributors before actual TGE
  function addContribution(address addr, uint256 fractionEXY, uint8 periods, uint8 months) public onlyManager beforeTGE {
    lockedContributions[addr] = lockedContribution({
      fractionEXY: fractionEXY,
      periods: periods,
      claimedPeriods: 0,
      periodDuration: months
    });
  }

  // create contributors data structure
  // bonus is given in promiles and it can be negative
  // 100 = +10%
  // -100 = -10%
  // -200 = -20%
  function contribute(int256 bonus) public payable duringTGE {
    uint256 exyTokens = uint256(int256(standardRate) + bonus) * msg.value;
    contributions[msg.sender] += exyTokens;
    // total supply can be increasexd right now
    IncreaseTotalSupply(exyTokens);
  }

  // claim tokens from given address
  // tokens can be claimed only after TGE
  function claim(address addr) public afterTGE {
    uint256 amount = 0;

    // if there was a standard contribution, send all tokens
    if (0 < contributions[addr]) {
      amount = contributions[addr];
      // clean balance before transfer
      contributions[addr] = 0;
      transfer(addr, amount);
    } else if (0 < lockedContributions[addr].periods - lockedContributions[addr].claimedPeriods) {
      // ignore claim after all periods were claimed
      require(lockedContributions[addr].claimedPeriods < lockedContributions[addr].periods);

      uint256 lastPayout = tgeEnd + (lockedContributions[addr].claimedPeriods + 1) * uint256(lockedContributions[addr].periodDuration) * 1 years / 12;
      // require lastPayout timestamp was before actual timestamp
      require(lastPayout < block.timestamp);

      // increase claimedPeriods counter
      lockedContributions[addr].claimedPeriods += 1;

      // calculate calimed amount as fraction of total supply
      // f.e. if contributor have 1% of all tokens
      // fractionEXY should be set as 0.01 * 1e18 = 1e16
      // then its multiplied by calculated totalSupply afterTGE
      // and then its divided by 1e18 which gives us totalSupply * 0.01
      amount = totalSupply * lockedContributions[addr].fractionEXY / 10 ** 18;
      transfer(addr, amount);
    }

    // circulating supply can be increased when
    // vested, locked or standard tokens are created
    circulatingSupply += amount;
  }

  // claim your tokens
  function claim() public afterTGE {
    claim(msg.sender);
  }


  // Modifiers:

  // only manager can call this
  modifier onlyManager() {
    require(msg.sender == contractManager);
    _;
  }

  // this can be ran only before TGE
  modifier beforeTGE() {
    require(block.timestamp < tgeStart);
    _;
  }

  // this can be ran only during TGE
  modifier duringTGE() {
    require(tgeStart < block.timestamp && block.timestamp < tgeEnd);
    _;
  }

  // this can be ran only after TGE
  modifier afterTGE() {
    require(tgeEnd < block.timestamp);
    _;
  }


  // ERC223 functions & events:

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
