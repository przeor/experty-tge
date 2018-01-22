pragma solidity ^0.4.11;

import "./SplittableTokenAllocation.sol";
import "./ERC223MintableToken.sol";
import "./Signatures.sol";
import "./SplitTypes.sol";
import "./BountyTokenAllocation.sol";

contract ExyToken is ERC223MintableToken {
  uint public circulatingSupply;

  Signatures private signatures;
  SplittableTokenAllocation private partnerTokensAllocation;
  SplittableTokenAllocation private companyTokensAllocation;
  BountyTokenAllocation private bountyTokensAllocation;

  /*
   * ICO TOKENS
   * 33%
   *
   * Ico tokens are sent to the ICO_TOKEN_ADDRESS immediately
   * after ExyToken initialization
   */ 
  uint constant ICO_TOKENS = 1000;
  address constant ICO_TOKENS_ADDRESS = 0x123;

  /*
   * COMPANY TOKENS
   * 33%
   *
   * Company tokens are being distrubited in 36 months
   * Total tokens = COMPANY_TOKENS_PER_PERIOD * COMPANY_PERIODS
   */
  uint constant COMPANY_TOKENS_PER_PERIOD = 100;
  uint constant COMPANY_PERIODS = 36;
  uint constant MINUTES_IN_COMPANY_PERIOD = 1; //1 years / 12 / 1 minutes;

  /*
   * PARTNER TOKENS
   * 30%
   *
   * Company tokens are avaialable after 18 months
   * Total tokens = PARTNER_TOKENS_PER_PERIOD * PARTNER_PERIODS
   */ 
  uint constant PARTNER_TOKENS_PER_PERIOD = 100;
  uint constant PARTNER_PERIODS = 1;
  uint constant MINUTES_IN_PARTNER_PERIOD = 1; //MINUTES_IN_COMPANY_PERIOD * 18;

  /*
   * BOUNTY TOKENS
   * 30%
   *
   * Bounty tokens can be sent immediately after initialization
   */ 
  uint constant BOUNTY_TOKENS = 1000;

  /*
   * MARKETING COST TOKENS 
   * 1%
   *
   * Tokens are sent to the MARKETING_COST_ADDRESS immediately
   * after ExyToken initialization
   */ 
  uint constant MARKETING_COST_TOKENS = 10;
  address constant MARKETING_COST_ADDRESS = 0xdaF3c8d1B8E2d79D4ff7A0B3173Bea847549ED3e;

  uint256 public initDate;

  AllocationAddressList private allocationAddressList;

  function ExyToken(address signaturer0, address signaturer1, address signaturer2) public {
    initDate = block.timestamp;
    signatures = new Signatures(signaturer0, signaturer1, signaturer2);
    partnerTokensAllocation = new SplittableTokenAllocation(
      COMPANY_TOKENS_PER_PERIOD,
      COMPANY_PERIODS,
      MINUTES_IN_COMPANY_PERIOD,
      initDate);

    companyTokensAllocation = new SplittableTokenAllocation(
      PARTNER_TOKENS_PER_PERIOD,
      PARTNER_PERIODS,
      MINUTES_IN_PARTNER_PERIOD,
      initDate);

    bountyTokensAllocation = new BountyTokenAllocation(
      BOUNTY_TOKENS
    );

    // minting marketing cost tokens
    mint(MARKETING_COST_ADDRESS, MARKETING_COST_TOKENS);
  }

  function getCompanyAllocationListLength() public returns (uint) {
    return companyTokensAllocation.getAllocationLength();
  }

  function getCompanyAllocation(uint nr) public returns (uint, address, uint, SplitTypes.SplitState, address) {
    address _address = companyTokensAllocation.allocationAddressList(nr);
    uint tokensPerPeriod;
    address proposalAddress;
    uint claimedPeriods;
    SplitTypes.SplitState splitState;
    (tokensPerPeriod, proposalAddress, claimedPeriods, splitState) = companyTokensAllocation.splitOf(_address);
    return (tokensPerPeriod, proposalAddress, claimedPeriods, splitState, _address);
  }

  function getPartnerAllocationListLength() public returns (uint) {
    return partnerTokensAllocation.getAllocationLength();
  }

  function getPartnerAllocation(uint nr) public returns (uint, address, uint, SplitTypes.SplitState, address) {
    address _address = partnerTokensAllocation.allocationAddressList(nr);
    uint tokensPerPeriod;
    address proposalAddress;
    uint claimedPeriods;
    SplitTypes.SplitState splitState;
    (tokensPerPeriod, proposalAddress, claimedPeriods, splitState) = partnerTokensAllocation.splitOf(_address);
    return (tokensPerPeriod, proposalAddress, claimedPeriods, splitState, _address);
  }

  function getBountyAllocationListLength() public returns (uint) {
    return bountyTokensAllocation.getAllocationLength();
  }

  function getBountyAllocation(uint nr) public returns (uint, address, SplitTypes.BountyState, address) {
    uint amount;
    address proposalAddress;
    SplitTypes.BountyState bountyState;

    address _address = partnerTokensAllocation.allocationAddressList(nr);
    (amount, proposalAddress, bountyState) = bountyTokensAllocation.bountyOf(_address);

    return (amount, proposalAddress, bountyState, _address);
  }

  function proposeCompanySplit(address _dest, uint _tokensPerPeriod) public onlySignaturer {
    companyTokensAllocation.proposeSplit(msg.sender, _dest, _tokensPerPeriod);
  }

  function approveCompanySplit(address _dest) public onlySignaturer {
    companyTokensAllocation.approveSplit(msg.sender, _dest);
  }

  function proposePartnerSplit(address _dest, uint _tokensPerPeriod) public onlySignaturer {
    partnerTokensAllocation.proposeSplit(msg.sender, _dest, _tokensPerPeriod);
  }

  function approvePartnerSplit(address _dest) public onlySignaturer {
    partnerTokensAllocation.approveSplit(msg.sender, _dest);
  }

  function proposeBountyTransfer(address _dest, uint _amount) public onlySignaturer {
    bountyTokensAllocation.proposeBountyTransfer(_dest, _amount);
  }

  function approveBountyTransfer(address _dest) public onlySignaturer {
    bountyTokensAllocation.approveBountyTransfer(_dest);
  }

  function mintMeTokens() public {
    uint tokensToMint = 0;
    uint parnterTokensToMint = partnerTokensAllocation.tokensToMint(msg.sender);
    if (parnterTokensToMint > 0) {
      tokensToMint = tokensToMint + partnerTokensAllocation.mint(msg.sender);
    }
    uint compnyTokensToMint = companyTokensAllocation.tokensToMint(msg.sender);
    if (compnyTokensToMint > 0) {
      tokensToMint = tokensToMint + companyTokensAllocation.mint(msg.sender);
    }
    if (tokensToMint > 0) {
      mint(msg.sender, tokensToMint);
    }
  }

  modifier onlySignaturer() {
    require(signatures.exist(msg.sender));
    _;
  }
}
