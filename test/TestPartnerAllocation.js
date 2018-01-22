const moment = require('moment');
const SplittableTokenAllocation = artifacts.require('SplittableTokenAllocation');

/*
 * Fields of the splitT structs:
 * struct SplitT {
 *   uint tokensPerPeriod;
 *   address proposalAddress;
 *   uint claimedPeriods;
 *   SplitState splitState;
 * }
 */

const SplitTFields = {
  tokensPerField: 0,
  proposalAddress: 1,
  claimedPeriods: 2,
  state: 3
}

const SplitState = {
  proposed: 0,
  approved: 1,
  rejected: 2
}

const minutesAgo = (nrOfMonths) =>
  moment().subtract(nrOfMonths, 'minutes').unix();

contract('Test partner token allocations', accounts => {
  const address0 = accounts[0];
  const address1 = accounts[1];
  const address2 = accounts[2];
  const address3 = accounts[3];
  const address4 = accounts[4];
  const address5 = accounts[5];
  // We are adding fromAddress object to the web3 functions (call and sendTransaction) to change the msg.sender
  const fromAddress1 = {
    from: address1
  }
  it('should initialise splittable allocation token', async () => {
    // test partner allocation with locked tokens for one period which lasts 18 minutes
    const partnerTokenAllocation = await SplittableTokenAllocation.new(1000, 1, 18, minutesAgo(1));
    // check that total supply is set correctly
    const totalSupply = await partnerTokenAllocation.totalSupply.call();
    assert.equal(totalSupply, 1000, 'Total supply has not been set correctly');
    // check that periods are set corretly for partners
    const periods = await partnerTokenAllocation.periods.call();
    assert.equal(periods, 1, 'Period has not been set correctly');
    // check that minutes in period is set corretly for partners
    const minutesInPeriod = await partnerTokenAllocation.minutesInPeriod.call();
    assert.equal(minutesInPeriod, 18, 'Months has not been set correctly');
  });

  it('should propose and accept split allocation', async () => {
    // test partner allocation with locked tokens for one period which lasts 18 minutes
    const partnerTokenAllocation = await SplittableTokenAllocation.new(1000, 1, 18, minutesAgo(1));
    const destAddr = accounts[1];
    const tokensPerPeriod = 100
    await partnerTokenAllocation.proposeSplit.sendTransaction(destAddr, tokensPerPeriod);
    await partnerTokenAllocation.approveSplit.sendTransaction(destAddr);
    const split = await partnerTokenAllocation.splitOf.call(destAddr);
    // split state should be equal to 1 cause state accepts (0 - Proposed, 1 - Accepted, 2 - Rejected)
    assert.equal(split[SplitTFields.state], SplitState.approved, 'Split is not approved');
    assert.equal(tokensPerPeriod, split[SplitTFields.tokensPerField], 'Tokens per period has not been set correctly');
  });

  it('sholud count claimed tokens value before period has passed', async () => {
    // test partner allocation with locked tokens for one period which lasts 18 minutes
    const partnerTokenAllocation = await SplittableTokenAllocation.new(1000, 1, 18, minutesAgo(3));
    const destAddr = accounts[1];
    const tokensPerPeriod = 100
    await partnerTokenAllocation.proposeSplit.sendTransaction(destAddr, tokensPerPeriod);
    await partnerTokenAllocation.approveSplit.sendTransaction(destAddr);
    const split = await partnerTokenAllocation.splitOf.call(destAddr);
    // split state should be equal to 1 cause state accepts (0 - Proposed, 1 - Accepted, 2 - Rejected)
    assert.equal(split[SplitTFields.state], SplitState.approved, 'Split is not approved');
    assert.equal(tokensPerPeriod, split[SplitTFields.tokensPerField], 'Tokens per period has not been set correctly');
    const expectedTokensToMint = 0;
    const tokensToMint = (await partnerTokenAllocation.tokensToMint.call(destAddr)).toNumber();
    assert.equal(expectedTokensToMint, tokensToMint, 'Tokens to mint has not been count correctly');
  });

  it('sholud count claimed tokens value after period has passed', async () => {
    // test partner allocation with locked tokens for one period which lasts 18 minutes
    const partnerTokenAllocation = await SplittableTokenAllocation.new(1000, 1, 18, minutesAgo(20));
    const destAddr = accounts[1];
    const tokensPerPeriod = 100
    await partnerTokenAllocation.proposeSplit.sendTransaction(destAddr, tokensPerPeriod);
    await partnerTokenAllocation.approveSplit.sendTransaction(destAddr);
    const split = await partnerTokenAllocation.splitOf.call(destAddr);
    // split state should be equal to 1 cause state accepts (0 - Proposed, 1 - Accepted, 2 - Rejected)
    assert.equal(split[SplitTFields.state], SplitState.approved, 'Split is not approved');
    assert.equal(tokensPerPeriod, split[SplitTFields.tokensPerField], 'Tokens per period has not been set correctly');
    const expectedTokensToMint = 100;
    const tokensToMint = (await partnerTokenAllocation.tokensToMint.call(destAddr)).toNumber();
    assert.equal(expectedTokensToMint, tokensToMint, 'Tokens to mint has not been count correctly');
  });

  it('should not add a second partner proposal for address', async () => {
    // test partner allocation with locked tokens for one period which lasts 18 minutes
    const partnerTokenAllocation = await SplittableTokenAllocation.new(1000, 1, 18, minutesAgo(20));
    const destAddr = accounts[1];
    const tokensPerPeriod = 100
    await partnerTokenAllocation.proposeSplit.sendTransaction(destAddr, tokensPerPeriod);
    // Testing if an error appears
    let err = null
    try {
      await partnerTokenAllocation.proposeSplit.sendTransaction(destAddr, tokensPerPeriod);
    } catch (error) {
      err = error
    }
    assert.ok(err instanceof Error)
  });

  it('should not add a partner proposal when there are not enough tokens to allocate', async () => {
    const partnerTokenAllocation = await SplittableTokenAllocation.new(100, 1, 18, minutesAgo(20));
    // Testing if an error appears
    let err = null
    try {
      await partnerTokenAllocation.proposeSplit.sendTransaction(accounts[2], 200);
    } catch (error) {
      err = error
    }
    assert.ok(err instanceof Error)
  });

  it('sholud count claimed tokens value after period has passed many times', async () => {
    // test partner allocation with locked tokens for one period which lasts 18 minutes
    const partnerTokenAllocation = await SplittableTokenAllocation.new(1000, 1, 18, minutesAgo(54));
    const destAddr = accounts[1];
    const tokensPerPeriod = 100
    await partnerTokenAllocation.proposeSplit.sendTransaction(destAddr, tokensPerPeriod);
    await partnerTokenAllocation.approveSplit.sendTransaction(destAddr);
    const split = await partnerTokenAllocation.splitOf.call(destAddr);
    // split state should be equal to 1 cause state accepts (0 - Proposed, 1 - Accepted, 2 - Rejected)
    assert.equal(split[SplitTFields.state], SplitState.approved, 'Split is not approved');
    assert.equal(tokensPerPeriod, split[SplitTFields.tokensPerField], 'Tokens per period has not been set correctly');
    const expectedTokensToMint = 100;
    const tokensToMint = (await partnerTokenAllocation.tokensToMint.call(destAddr)).toNumber();
    // tokens to mint should equal declarated tokens per period,
    // when period has passed many times, for partners tokens are set to one period
    assert.equal(expectedTokensToMint, tokensToMint, 'Tokens to mint has not been count correctly');
  });

  it('sholud reject proposed split', async () => {
    // test partner allocation with locked tokens for one period which lasts 18 minutes
    const partnerTokenAllocation = await SplittableTokenAllocation.new(1000, 1, 18, minutesAgo(54));
    const destAddr = accounts[1];
    const tokensPerPeriod = 100
    await partnerTokenAllocation.proposeSplit.sendTransaction(destAddr, tokensPerPeriod);
    await partnerTokenAllocation.rejectSplit.sendTransaction(destAddr);
    const split = await partnerTokenAllocation.splitOf.call(destAddr);
    // split state should be equal to 1 cause state accepts (0 - Proposed, 1 - Accepted, 2 - Rejected)
    assert.equal(split[SplitTFields.state], SplitState.rejected, 'Split is not rejected');
  });
  it('should not invoke company approval because I am not a signaturer', async () => {
    const partnerTokenAllocation = await SplittableTokenAllocation.new(1000, 1, 18, minutesAgo(54));
    // Testing if an error appears
    let err = null
    try {
      await partnerTokenAllocation.approveSplit.sendTransaction(address5, fromAddress1);
    } catch (error) {
      err = error
    }
    assert.ok(err instanceof Error);
  });
  it('should not invoke company reject because I am not a signaturer', async () => {
    const partnerTokenAllocation = await SplittableTokenAllocation.new(1000, 1, 18, minutesAgo(54));
    // Testing if an error appears
    let err = null
    try {
      await partnerTokenAllocation.rejectSplit.sendTransaction(address5, fromAddress1);
    } catch (error) {
      err = error
    }
    assert.ok(err instanceof Error);
  });

  it('should not invoke company proposal because I am not a signaturer', async () => {
    const partnerTokenAllocation = await SplittableTokenAllocation.new(1000, 1, 18, minutesAgo(54));
    // Testing if an error appears
    let err = null
    try {
      await partnerTokenAllocation.proposeSplit.sendTransaction(address4, 200, fromAddress1);
    } catch (error) {
      err = error
    }
    assert.ok(err instanceof Error);
  });
});
