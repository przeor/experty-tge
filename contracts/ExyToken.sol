pragma solidity ^0.4.11;

import "./SplittableTokenAllocation.sol";
import "./ERC223MintableToken.sol";
import "./Signatures.sol";
import "./SplitTypes.sol";

contract ExyToken is ERC223MintableToken {
  uint public circulatingSupply;

  Signatures private signatures;
  SplittableTokenAllocation private partnerTokensAllocation;
  SplittableTokenAllocation private companyTokensAllocation;

  /* COMPANY TOKENS */
  uint constant COMPANY_TOKENS_PER_PERIOD = 100;
  uint constant COMPANY_PERIODS = 1;
  uint constant MINUTES_IN_COMPPANY_PERIOD = 1;

  /* PARTNER TOKENS */
  uint constant PARTNER_TOKENS_PER_PERIOD = 100;
  uint constant PARTNER_PERIODS = 1;
  uint constant MINUTES_IN_PARTNER_PERIOD = 1;

  uint256 public initDate;

  AllocationAddressList private allocationAddressList;

  function ExyToken(address signaturer0, address signaturer1, address signaturer2) public {
    initDate = block.timestamp;
    signatures = new Signatures(signaturer0, signaturer1, signaturer2);
    partnerTokensAllocation = new SplittableTokenAllocation(
      COMPANY_TOKENS_PER_PERIOD,
      COMPANY_PERIODS,
      MINUTES_IN_COMPPANY_PERIOD,
      initDate);

    companyTokensAllocation = new SplittableTokenAllocation(
      PARTNER_TOKENS_PER_PERIOD,
      PARTNER_PERIODS,
      MINUTES_IN_PARTNER_PERIOD,
      initDate);
  }

  function getCompanyAllocationListLength() public returns (uint) {
    return 5;
  }

  function getCompanyAllocation(uint nr) public returns (uint, address, uint, SplitTypes.SplitState, address) {
    address _address =  address(0x0); // companyTokensAllocation.allocationAddressList(nr);
    uint tokensPerPeriod;
    address proposalAddress;
    uint claimedPeriods;
    SplitTypes.SplitState splitState;
    (tokensPerPeriod, proposalAddress, claimedPeriods, splitState) = companyTokensAllocation.splitOf(_address);
    // return (tokensPerPeriod,proposalAddress,claimedPeriods, splitState, _address);
    return (100, address(0x0), 1, SplitTypes.SplitState.Approved, address(0x1234567890));
  }

  function proposeCompanySplit(address _dest, uint _tokensPerPeriod) public onlySignaturer {
    companyTokensAllocation.proposeSplit(_dest, _tokensPerPeriod);
  }

  function approveCompanySplit(address _dest) public onlySignaturer {
    companyTokensAllocation.approveSplit(_dest);
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
