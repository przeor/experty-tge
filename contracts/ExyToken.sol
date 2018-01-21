pragma solidity ^0.4.11;
import "./SplittableTokenAllocation.sol";
import "./ERC223MintableToken.sol";
import "./Signatures.sol";

contract ExyToken is ERC223Token {
  uint public circulatingSupply;

  Signatures private signatures;
  SplittableTokenAllocation private partnerTokensAllocation;
  SplittableTokenAllocation private companyTokensAllocation;
  
  /* COMPANY TOKENS */
  uint constant TOTAL_COMPANY_TOKENS = 100;
  address constant COMPANY_TOKENS_VIRTUAL_ADDRESS = 0x0;
  uint constant COMPANY_PERIODS = 1;
  uint constant MONTHS_IN_COMPPANY_PERIOD = 1;

  /* PARTNER TOKENS */
  uint constant TOTAL_PARTNER_TOKENS = 100;
  address constant PARTNER_TOKENS_VIRTUAL_ADDRESS = 0x0;
  uint constant PARTNER_PERIODS = 1;
  uint constant MONTHS_IN_PARTNER_PERIOD = 1;

  uint256 public initDate;

  function ExyToken(address signaturer0, address signaturer1, address signaturer2) public {
    initDate = block.timestamp;
    signatures = new Signatures(signaturer0, signaturer1, signaturer2);
    partnerTokensAllocation = new SplittableTokenAllocation(
      COMPANY_TOKENS_VIRTUAL_ADDRESS,
      TOTAL_COMPANY_TOKENS,
      COMPANY_PERIODS,
      MONTHS_IN_COMPPANY_PERIOD,
      initDate);

    companyTokensAllocation = new SplittableTokenAllocation(
      PARTNER_TOKENS_VIRTUAL_ADDRESS,
      TOTAL_PARTNER_TOKENS,
      PARTNER_PERIODS,
      MONTHS_IN_PARTNER_PERIOD,
      initDate);
  }

  function proposeCompanySplit(address _dest, uint _tokensPerPeriod) public onlySignaturer {
    companyTokensAllocation.proposeSplit(_dest, _tokensPerPeriod);
  }

  function approveCompanySplit(address _dest) public onlySignaturer {
    companyTokensAllocation.approveSplit(_dest);
  }

  // function claim() public {
  //   // claimCompanyTokens();
  //   // claimPartnerTokens();
  // }

  // function claimCompanyTokens() private {
  //   uint tokensToMint = companyTokensAllocation.mint(_dest);
  // }
  modifier onlySignaturer() {
    require(signatures.exist(msg.sender));
    _;
  }

}
