pragma solidity ^0.4.4;

import "./SafeMath.sol";
import "./Ownable.sol";
import "./AllocationAddressList.sol";
import "./SplitTypes.sol";

contract SplittableTokenAllocation is Ownable, AllocationAddressList {

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
  mapping (address => SplitTypes.SplitT) public splitOf;

  /**
   * SplittableTokenAllocation contructor.
   * RemainingTokensPerPeriod variable which represents
   * the remaining amount of tokens to be distributed
   */
  // Invoking parent constructor (OwnedBySignaturers) with signatures addresses
  function SplittableTokenAllocation(uint _tokensPerPeriod, uint _periods, uint _minutesInPeriod, uint _initalTimestamp)  Ownable() public {
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
  function proposeSplit(address _proposerAddress, address _dest, uint _tokensPerPeriod) public onlyOwner {
    require(_tokensPerPeriod > 0);
    require(_tokensPerPeriod <= remainingTokensPerPeriod);
    // In solidity there is no "exist" method on a map key.
    // We can't overwrite existing proposal, so we are checking if it is the default value (0x0)
    require(splitOf[_dest].proposerAddress == 0x0);

    splitOf[_dest] = SplitTypes.SplitT({
      tokensPerPeriod: _tokensPerPeriod,
      splitState: SplitTypes.SplitState.Proposed,
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
  function approveSplit(address _approverAddress, address _address) public onlyOwner {
    require(splitOf[_address].splitState == SplitTypes.SplitState.Proposed);
    require(splitOf[_address].proposerAddress != _approverAddress);
    splitOf[_address].splitState = SplitTypes.SplitState.Approved;
  }

 /**
   * Rejects the split allocation
   *
   * @param _address - address for the split to be rejected
   */
  function rejectSplit(address _address) public onlyOwner {
    require(splitOf[_address].splitState == SplitTypes.SplitState.Proposed);
    splitOf[_address].splitState = SplitTypes.SplitState.Rejected;
    remainingTokensPerPeriod = remainingTokensPerPeriod + splitOf[_address].tokensPerPeriod;
  }

  /**
   * Returns how many tokens are available to mint.
   *
   * @param _address - address for whom we are counting tokens
   */
  function tokensToMint(address _address) public view returns (uint) {
    SplitTypes.SplitT storage split = splitOf[_address];
    if (split.splitState == SplitTypes.SplitState.Approved) {
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
  function _tokensToMint(SplitTypes.SplitT storage split) private view returns (uint) {
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
   * Updates number of claimed periods
   *
   * @param _address - address for whom we minting
   */
  function updateClaimedPeriods(address _address) public onlyOwner {
    splitOf[_address].claimedPeriods = _periodsElapsed();
  }

}
