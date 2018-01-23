pragma solidity ^0.4.4;

import "./SafeMath.sol";
import "./Ownable.sol";
import "./AllocationAddressList.sol";
import "./Types.sol";

contract VestingAllocation is Ownable, AllocationAddressList {

  // This contract describes how the tokens are being released in time

  // How many distributions periods there are
  uint public periods;
  // How long is one interval
  uint public minutesInPeriod;
  // Total amount of remaining tokens to be distributed
  uint public remainingTokensPerPeriod;
  // Total amount of all tokens
  uint public totalSupply;
  // Inital timestamp
  uint public initTimestamp;

  // For each address we can add exactly one possible split.
  // If we try to add another proposal on existing address it will be rejected
  mapping (address => Types.StructVestingAllocation) public allocationOf;

  /**
   * VestingAllocation contructor.
   * RemainingTokensPerPeriod variable which represents
   * the remaining amount of tokens to be distributed
   */
  // Invoking parent constructor (OwnedBySignaturers) with signatures addresses
  function VestingAllocation(uint _tokensPerPeriod, uint _periods, uint _minutesInPeriod, uint _initalTimestamp)  Ownable() public {
    totalSupply = _tokensPerPeriod * _periods;
    periods = _periods;
    minutesInPeriod = _minutesInPeriod;
    remainingTokensPerPeriod = _tokensPerPeriod;
    initTimestamp = _initalTimestamp;
  }

  /**
   * Propose split method adds proposal to the splits Array.
   *
   * @param _dest              - address of the new receiver
   * @param _tokensPerPeriod   - how many tokens we are giving to dest
   */
  function proposeAllocation(address _proposerAddress, address _dest, uint _tokensPerPeriod) public onlyOwner {
    require(_tokensPerPeriod > 0);
    require(_tokensPerPeriod <= remainingTokensPerPeriod);
    // In solidity there is no "exist" method on a map key.
    // We can't overwrite existing proposal, so we are checking if it is the default value (0x0)
    require(allocationOf[_dest].proposerAddress == 0x0);

    allocationOf[_dest] = Types.StructVestingAllocation({
      tokensPerPeriod: _tokensPerPeriod,
      allocationState: Types.AllocationState.Proposed,
      proposerAddress: _proposerAddress,
      claimedPeriods: 0
    });

    allocationAddressList.push(_dest);
    remainingTokensPerPeriod = remainingTokensPerPeriod - _tokensPerPeriod; // TODO safe-math
  }

  /**
   * Approves the split allocation, so it can be claimed after periods
   *
   * @param _address - address for the split
   */
  function approveAllocation(address _approverAddress, address _address) public onlyOwner {
    require(allocationOf[_address].allocationState == Types.AllocationState.Proposed);
    require(allocationOf[_address].proposerAddress != _approverAddress);
    allocationOf[_address].allocationState = Types.AllocationState.Approved;
  }

 /**
   * Rejects the split allocation
   *
   * @param _address - address for the split to be rejected
   */
  function rejectSplit(address _address) public onlyOwner {
    require(allocationOf[_address].allocationState == Types.AllocationState.Proposed);
    allocationOf[_address].allocationState = Types.AllocationState.Rejected;
    remainingTokensPerPeriod = remainingTokensPerPeriod + allocationOf[_address].tokensPerPeriod;
  }

  /**
   * Returns how many tokens are available to mint.
   *
   * @param _address - address for whom we are counting tokens
   */
  function tokensToMint(address _address) public view returns (uint) {
    Types.StructVestingAllocation storage split = allocationOf[_address];
    if (split.allocationState == Types.AllocationState.Approved) {
      return _tokensToMint(split);
    }
    return 0;
  }

  /*
   * _tokensToMint returs the total amount of tokens that are ready to be minted.
   *  From starting date initTimestamp, after each period the split.tokensPerPeriod
   *  are available to be mint.
   *  We calculate numberOfPeriods number from (0..periods) and then multiply it
   *  by the number of tokens per period
   */
  function _tokensToMint(Types.StructVestingAllocation storage split) private view returns (uint) {
    // I use math min cause when elapsed periods count is higher than periods
    // declareted for one split we have to use subtraction from declarated periods.
    uint numberOfPeriods = SafeMath.min(_periodsElapsed(), periods);
    return (numberOfPeriods - split.claimedPeriods) * split.tokensPerPeriod;
  }

  /*
   * _periodsElapsed returns the amount of periods that passed from initTimestampe
   */
  function _periodsElapsed() public view returns(uint) {
    uint periodsElapsed = (block.timestamp - initTimestamp) / (minutesInPeriod * 1 minutes);
    return periodsElapsed;
  }
  /**
   * Minting tokens and updating the claimedPeriod value for split
   *
   * @param _address - address for whom we minting
   */
  function mint(address _address) public onlyOwner returns (uint) {
    uint tokens = _tokensToMint(allocationOf[_address]);
    allocationOf[_address].claimedPeriods = _periodsElapsed();
    return tokens;
  }

}
