pragma solidity ^0.4.11;

contract ExpertyToken {
  function withdraw(address addr, uint256 amount) public;
  function splitPartnersAllocation(address addr, uint256 fractionEXY) public;
}

contract MultisigExpertyEthControl {

  /*signatories*/
  address expertyTokenAddr;
  
  enum Entity { NONE, EXPERTY_AG, BITCOIN_SUISSE, ANY }
  enum Action { NONE, WITHDRAW, SPLIT_PARTNER_ALLOCATION }

  mapping(address => Entity) public signatory;

  struct RequiredSignatures {
    Entity entity;
    uint8 minQuantity;
  }
  mapping(uint8 => RequiredSignatures) public signaturesRules;

  struct WithdrawProposal {
    address addr;
    uint256 amount;
  }
  WithdrawProposal[] public withdrawProposals;

  struct SplitPartnersAllocationProposal {
    address addr;
    uint256 fractionEXY;
  }
  SplitPartnersAllocationProposal[] public splitPartnersAllocationProposals;

  struct Proposal {
    // Entity type;

  }

  function MultisigExpertyEthControl() public {

    signatory[0x123] = Entity.BITCOIN_SUISSE;
    signatory[0x123] = Entity.BITCOIN_SUISSE;
    signatory[0x123] = Entity.BITCOIN_SUISSE;
    signatory[0x123] = Entity.EXPERTY_AG;
    signatory[0x123] = Entity.EXPERTY_AG;
    signatory[0x123] = Entity.EXPERTY_AG;

    signaturesRules[uint8(Action.WITHDRAW)] = RequiredSignatures({
      entity: Entity.ANY,
      minQuantity: 4
    });

    signaturesRules[uint8(Action.SPLIT_PARTNER_ALLOCATION)] = RequiredSignatures({
      entity: Entity.EXPERTY_AG,
      minQuantity: 2
    });

  }

  function proposeWithdraw(address addr, uint256 amount) public onlySignatory {
    withdrawProposals.push(WithdrawProposal(addr, amount));
  }

  function proposeSplitPartnersAllocation(address addr, uint256 fractionEXY) public onlySignatory {
    splitPartnersAllocationProposals.push(SplitPartnersAllocationProposal(addr, fractionEXY));
  }

  function confirmProposal(uint256 proposalIdx) public onlySignatory {

  }

  // only signatory can call this
  modifier onlySignatory() {
    require(signatory[msg.sender] != Entity.NONE);
    require(isSender(msg.sender));
    _;
  }

  // make sure that function was initiated directly by msg.sender
  // and it was not called by another contract
  function isSender(address addr) public returns (bool isSender) {
    return msg.sender == addr && tx.origin == addr;
  }

  function test() public pure constant returns (uint8 test) {
    return uint8(Entity.NONE);
  }
}
