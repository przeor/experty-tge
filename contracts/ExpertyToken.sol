pragma solidity ^0.4.11;
import './ERC223Token.sol';
/**
 * Math operations with safety checks
 */

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

    // manager who will be adding presale contributions
    contractManager = 0x123;

    // withdraw of ether tokens can be done only by multisignature wallet
    ethMultisigContract = 0x123;
    exyMultisigContract = 0x123;
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

    mintToken(addr, claimedAmount);
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
  function mintToken(address to, uint value) private {
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
    Transfer(msg.sender, to, value, empty);
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
}

