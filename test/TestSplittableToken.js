const SplittableTokenAllocation = artifacts.require('SplittableTokenAllocation');

// positions of field from splitT struct
// struct SplitT {
//   address dest;
//   uint tokensPerPeriod;
//   bool isApproved;
//   address proposalAddress;
//   uint claimedPeriods;
// }

const DEST_FIELD = 0;
const TOKENS_PER_PERIOD_FIELD = 1;
const IS_APPROVED_FIELD = 2;
const PROPOSAL_ADDRESS_FIELD = 3;
const CLAIMED_PERIODS_FIELD = 4;

// Constructor params
// address virtualAddress;
// uint totalSupply;
// uint periods;
// uint months;
const MOCK_VIRTUAL_ADDRESS = 0x0;
const MOCK_TOTAL_SUPPLY = 1000;
const MOCK_PERIODS = 10;
const MOCK_MONTHS_IN_PERIOD = 2;

contract('SplittableTokenAllocation', accounts => {
  let splittableTokenAllocation;

  it('should initialise splittable allocation token', async () => {
    splittableTokenAllocation = await SplittableTokenAllocation.new(MOCK_VIRTUAL_ADDRESS, MOCK_TOTAL_SUPPLY, MOCK_PERIODS, MOCK_MONTHS_IN_PERIOD);
    const virtualAddress = await splittableTokenAllocation.virtualAddress.call();
    assert.equal(virtualAddress, MOCK_VIRTUAL_ADDRESS, 'Virtual address has not been set correctly');
    const totalSupply = await splittableTokenAllocation.totalSupply.call();
    assert.equal(totalSupply, MOCK_TOTAL_SUPPLY, 'Total supply has not been set correctly');
    const periods = await splittableTokenAllocation.periods.call();
    assert.equal(periods, MOCK_PERIODS, 'Period has not been set correctly');
    const monthsInPeriod = await splittableTokenAllocation.monthsInPeriod.call();
    assert.equal(monthsInPeriod, MOCK_MONTHS_IN_PERIOD, 'Months has not been set correctly');
  });

  it('should propose and accept split allocation', async () => {
    const destAddr = accounts[1];
    const transactionConfig = {
      from: accounts[1]
    }

    await splittableTokenAllocation.proposeSplit.sendTransaction(destAddr, 100, transactionConfig);

    const lastSplitId = (await splittableTokenAllocation.getLastSplitId.call()).toNumber();
    await splittableTokenAllocation.approveSplit.sendTransaction(lastSplitId);

    const split = await splittableTokenAllocation.splits.call(lastSplitId);
    assert.isTrue(split[IS_APPROVED_FIELD], 'Split is not approved');
  });

});
