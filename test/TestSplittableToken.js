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

contract('SplittableTokenAllocation', accounts => {
  let splittableTokenAllocation;

  it('should propose and accept split allocation', async () => {
    splittableTokenAllocation = await SplittableTokenAllocation.new();
    const splitPool = 0x0;
    const destAddr = accounts[0];
    await splittableTokenAllocation.proposeSplit.sendTransaction(splitPool, destAddr, 100);

    const lastSplitId = (await splittableTokenAllocation.getLastSplitId.call()).toNumber();
    await splittableTokenAllocation.approveSplit.sendTransaction(lastSplitId);

    const split = await splittableTokenAllocation.splits.call(lastSplitId);
    assert.isTrue(split[IS_APPROVED_FIELD], 'Split is not approved');
  });

});
