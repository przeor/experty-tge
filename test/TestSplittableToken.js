const SplittableTokenAllocation = artifacts.require('SplittableTokenAllocation');

// positions of field from splitT struct
// struct splitT {
//   address source;
//   address dest;
//   uint tokens;
//   bool isApproved;
//   bool isExecuted;
// }
const SOURCE_FIELD = 0;
const DEST_FIELD = 1;
const TOKENS_FIELD = 2;
const IS_APPROVED_FIELD = 3;
const IS_EXECUTED_FIELD = 4;

// Constructor params
// uint exyPerPeriod;
// uint periods;
// uint months;
const MOCK_EXPERTY_PER_PERIOD = 1000;
const MOCK_PERIODS = 10;
const MOCK_MONTHS = 2;

contract('SplittableTokenAllocation', accounts => {
  let splittableTokenAllocation;

  it('should initialise splittable allocation token', async () => {
    splittableTokenAllocation = await SplittableTokenAllocation.new(MOCK_EXPERTY_PER_PERIOD, MOCK_PERIODS, MOCK_MONTHS);
    const exyPerPeriod = await splittableTokenAllocation.exyPerPeriod.call();
    assert.equal(exyPerPeriod, MOCK_EXPERTY_PER_PERIOD, 'Experty token per period has not been set correctly');
    const periods = await splittableTokenAllocation.periods.call();
    assert.equal(periods, MOCK_PERIODS, 'Period has not been set correctly');
    const months = await splittableTokenAllocation.months.call();
    assert.equal(months, MOCK_MONTHS, 'Months has not been set correctly');
  });

  it('should propose and accept split allocation', async () => {
    const splitPool = 0x0;
    const destAddr = accounts[0];
    await splittableTokenAllocation.proposeSplit.sendTransaction(splitPool, destAddr, 100);

    const lastSplitId = (await splittableTokenAllocation.getLastSplitId.call()).toNumber();
    await splittableTokenAllocation.approveSplit.sendTransaction(lastSplitId);

    const split = await splittableTokenAllocation.splits.call(lastSplitId);
    assert.isTrue(split[IS_APPROVED_FIELD], 'Split is not approved');
  });

});
