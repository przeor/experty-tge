pragma solidity ^0.4.11;

import "./VestingAllocation.sol";
import "./ERC223MintableToken.sol";
import "./Signatures.sol";
import "./Types.sol";
import "./BountyTokenAllocation.sol";

contract ExyToken is ERC223MintableToken {
  uint public circulatingSupply;

  Signatures private signatures;
  VestingAllocation private partnerTokensAllocation;
  VestingAllocation private companyTokensAllocation;
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

  /**
   * ExyToken contructor.
   *
   * Exy token contains allocations of:
   * - partnerTokensAllocation
   * - companyTokensAllocation
   * - bountyTokensAllocation
   *
   * @param signaturer0 Address of first signaturer.
   * @param signaturer1 Address of second signaturer.
   * @param signaturer2 Address of third signaturer.
   *
   * Arguments in constructor are only for testing. When deploying
   * on main net, please hardcode them inside:
   * address signaturer0 = 0x0;
   * address signaturer1 = 0x1;
   * address signaturer2 = 0x2;
   */
  function ExyToken(address signaturer0, address signaturer1, address signaturer2) public {
    name = "Experty Token";
    symbol = "EXY";
    decimals = 18;

    initDate = block.timestamp;
    signatures = new Signatures(signaturer0, signaturer1, signaturer2);
    companyTokensAllocation = new VestingAllocation(
      COMPANY_TOKENS_PER_PERIOD,
      COMPANY_PERIODS,
      MINUTES_IN_COMPANY_PERIOD,
      initDate);

    partnerTokensAllocation = new VestingAllocation(
      PARTNER_TOKENS_PER_PERIOD,
      PARTNER_PERIODS,
      MINUTES_IN_PARTNER_PERIOD,
      initDate);

    bountyTokensAllocation = new BountyTokenAllocation(
      BOUNTY_TOKENS
    );

    // minting marketing cost tokens
    mint(MARKETING_COST_ADDRESS, MARKETING_COST_TOKENS);

    // minting ICO tokens
    mint(ICO_TOKENS_ADDRESS, ICO_TOKENS);
  }

  /**
   * Adds a proposition of a company token split to companyTokensAllocation
   */
  function proposeCompanyAllocation(address _dest, uint _tokensPerPeriod) public onlySignaturer {
    companyTokensAllocation.proposeAllocation(msg.sender, _dest, _tokensPerPeriod);
  }

  /**
   * Approves a proposition of a company token split
   */
  function approveCompanyAllocation(address _dest) public onlySignaturer {
    companyTokensAllocation.approveAllocation(msg.sender, _dest);
  }

  /**
   * Return number of company allocations
   * @return Length of company allocations
   */
  function getCompanyAllocationListLength() public view returns (uint) {
    return companyTokensAllocation.getAllocationLength();
  }

  /**
   * Given the index of the company allocation in allocationAddressList
   * we find its reciepent address and return struct with informations
   * about this allocation
   *
   * @param nr Index of allocation in allocationAddressList
   * @return Information about company alloction
   */
  function getCompanyAllocation(uint nr) public view returns (uint, address, uint, Types.AllocationState, address) {
    address recipientAddress = companyTokensAllocation.allocationAddressList(nr);
    var (tokensPerPeriod, proposalAddress, claimedPeriods, allocationState) = companyTokensAllocation.allocationOf(recipientAddress);
    return (tokensPerPeriod, proposalAddress, claimedPeriods, allocationState, recipientAddress);
  }

  /**
   * Adds a proposition of a partner token split to companyTokensAllocation
   */
  function proposePartnerAllocation(address _dest, uint _tokensPerPeriod) public onlySignaturer {
    partnerTokensAllocation.proposeAllocation(msg.sender, _dest, _tokensPerPeriod);
  }

  /**
   * Approves a proposition of a partner token split
   */
  function approvePartnerAllocation(address _dest) public onlySignaturer {
    partnerTokensAllocation.approveAllocation(msg.sender, _dest);
  }

  /**
   * Return number of partner allocations
   * @return Length of parnters allocations array
   */
  function getPartnerAllocationListLength() public view returns (uint) {
    return partnerTokensAllocation.getAllocationLength();
  }

  /**
   * Given the index of the partner allocation in allocationAddressList
   * we find its reciepent address and return struct with informations
   * about this allocation
   *
   * @param nr Index of allocation in allocationAddressList
   * @return Information about partner alloction
   */
  function getPartnerAllocation(uint nr) public view returns (uint, address, uint, Types.AllocationState, address) {
    address recipientAddress = partnerTokensAllocation.allocationAddressList(nr);
    var (tokensPerPeriod, proposalAddress, claimedPeriods, allocationState) = partnerTokensAllocation.allocationOf(recipientAddress);
    return (tokensPerPeriod, proposalAddress, claimedPeriods, allocationState, recipientAddress);
  }

  function proposeBountyTransfer(address _dest, uint _amount) public onlySignaturer {
    bountyTokensAllocation.proposeBountyTransfer(_dest, _amount);
  }

  function approveBountyTransfer(address _dest) public onlySignaturer {
    bountyTokensAllocation.approveBountyTransfer(_dest);
  }
  function getBountyAllocationListLength() public view returns (uint) {
    return bountyTokensAllocation.getAllocationLength();
  }

  function getBountyAllocation(uint nr) public view returns (uint, address, Types.BountyState, address) {
    address recipientAddress = bountyTokensAllocation.allocationAddressList(nr);
    var (amount, proposalAddress, bountyState) = bountyTokensAllocation.bountyOf(recipientAddress);
    return (amount, proposalAddress, bountyState, recipientAddress);
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
