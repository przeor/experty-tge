const ExyToken = artifacts.require('ExyToken');

const TOKENS_PER_PERIOD = 0;

const SplitState = {
  proposed: 0,
  approved: 1,
  rejected: 2
}

contract('ExyToken', accounts => {
  let exy;
  let fromAddress0 = { from: accounts[0] };
  let fromAddress1 = { from: accounts[1] };
  const address0 = accounts[0];
  const address1 = accounts[1];
  const address2 = accounts[2];
  const address3 = accounts[3];
  const address4 = accounts[4];
  const address5 = accounts[5];

  it('should initialize ExyToken', async () => {
    exy = await ExyToken.new(accounts[0], accounts[1], accounts[2]);
    assert.equal(await exy.getPartnerAllocationListLength.call(), 0, 'should be mocked value');
    assert.equal(await exy.getCompanyAllocationListLength.call(), 0, 'should be mocked value');
    assert.equal(await exy.getBountyTransfersListLength.call(), 0, 'should be mocked value');
  });

  it('should propose company allocation', async () => {
    exy = await ExyToken.new(accounts[0], accounts[1], accounts[2]);
    await exy.proposeCompanySplit.sendTransaction(accounts[3], 100, { from: accounts[0] });
    await exy.approveCompanySplit.sendTransaction(accounts[3], fromAddress1);

    let allocation = await exy.getCompanyAllocation.call(0);

    assert.equal(allocation[TOKENS_PER_PERIOD], 100, 'Allocation should be set to 100');
    assert.equal(allocation[1], accounts[0], 'Proposal address should be set to accounts[0]');
    assert.equal(allocation[2], 0, 'claimedPeriods should be 0');
    assert.equal(allocation[3], SplitState.approved, 'SplitState should be approved');
    assert.equal(allocation[4], accounts[3], 'Destinantion address shuld be equal accounts[3]');
  });

  it('should not invoke company proposal because I am not a signaturer', async () => {
    exy = await ExyToken.new(accounts[0], accounts[1], accounts[2]);
    // Testing if an error appears
    let err = null
    try {
      await exy.proposeCompanySplit.sendTransaction(address3, 100, { from: address4 });
    } catch (error) {
      err = error
    }
    assert.ok(err instanceof Error);
  });

  it('should not invoke company approval because I am not a signaturer', async () => {
    exy = await ExyToken.new(accounts[0], accounts[1], accounts[2]);
    await exy.proposeCompanySplit.sendTransaction(address3, 100);
    // Testing if an error appears
    let err = null
    try {
      await exy.approveCompanySplit.sendTransaction(address5, { from: address3 });
    } catch (error) {
      err = error
    }
    assert.ok(err instanceof Error);
  });

  it('should not invoke company reject because I am not a signaturer', async () => {
    exy = await ExyToken.new(accounts[0], accounts[1], accounts[2]);
    // Testing if an error appears
    let err = null
    try {
      await exy.rejectCompanySplit.sendTransaction(address2, { from: address5 });
    } catch (error) {
      err = error
    }
    assert.ok(err instanceof Error);
  });

  it('should not allow to allocate more tokens than company allocation', async () => {
    exy = await ExyToken.new(accounts[0], accounts[1], accounts[2]);

    await exy.proposeCompanySplit.sendTransaction(accounts[3], 50);
    await exy.proposeCompanySplit.sendTransaction(accounts[4], 20);

    let err = null
    try {
      await exy.proposeCompanySplit.sendTransaction(accounts[5], 31);
    } catch (error) {
      err = error
    }
    assert.ok(err instanceof Error);
  });

  it('should update company allocation list', async () => {
    exy = await ExyToken.new(accounts[0], accounts[1], accounts[2]);
    assert.equal(await exy.getCompanyAllocationListLength.call(), 0, "List should be empty");
    await exy.proposeCompanySplit.sendTransaction(accounts[0], 50);
    assert.equal(await exy.getCompanyAllocationListLength.call(), 1, "We should have one element");
  });

  it('should update partner allocation list', async () => {
    exy = await ExyToken.new(accounts[0], accounts[1], accounts[2]);
    assert.equal(await exy.getPartnerAllocationListLength.call(), 0, "List should be empty");
    await exy.proposePartnerSplit.sendTransaction(accounts[0], 50);
    assert.equal(await exy.getPartnerAllocationListLength.call(), 1, "We should have one element");
  });

  it('should update bounty transfer list', async () => {
    exy = await ExyToken.new(accounts[0], accounts[1], accounts[2]);
    assert.equal(await exy.getBountyTransfersListLength.call(), 0, "List should be empty");
    await exy.proposeBountyTransfer.sendTransaction(accounts[0], 50);
    assert.equal(await exy.getBountyTransfersListLength.call(), 1, "We should have one element");
  });

  it('should decrease remaining company tokens per period after proposal', async () => {
    exy = await ExyToken.new(accounts[0], accounts[1], accounts[2]);

    let initVal = await exy.getRemainingCompanyTokensAllocation.call();
    await exy.proposeCompanySplit.sendTransaction(address3, 1);
    assert.equal(initVal - await exy.getRemainingCompanyTokensAllocation.call(), 1, 'Should be 1 token less left for allocation');
  });

  it('should decrease remaining partner tokens per period after proposal', async () => {
    exy = await ExyToken.new(accounts[0], accounts[1], accounts[2]);

    let initVal = await exy.getRemainingPartnerTokensAllocation.call();
    await exy.proposePartnerSplit.sendTransaction(address3, 1);
    assert.equal(initVal - await exy.getRemainingPartnerTokensAllocation.call(), 1, 'Should be 1 token less left for allocation');
  });

  it('should decrease remaining bounty tokens after proposal', async () => {
    exy = await ExyToken.new(accounts[0], accounts[1], accounts[2]);

    let initVal = await exy.getRemainingBountyTokens.call();
    await exy.proposeBountyTransfer.sendTransaction(address3, 1);
    assert.equal(initVal - await exy.getRemainingBountyTokens.call(), 1, 'Should be 1 token less left for tokens');
  });

  it('should approve bounty transfer and mint tokens', async () => {
    exy = await ExyToken.new(accounts[0], accounts[1], accounts[2]);
    await exy.proposeBountyTransfer.sendTransaction(accounts[0], 50);
    assert.equal(await exy.balanceOf(accounts[0]), 0, "We should have 0 tokens at the beginning");
    await exy.approveBountyTransfer.sendTransaction(accounts[0], fromAddress1);
    assert.equal(await exy.getBountyTransfersListLength.call(), 1, "We should have one element");
    assert.equal(await exy.balanceOf(accounts[0]), 50, "We should have approved tokens");
  });

  it('should approve company and partner aloocations', async () => {
    exy = await ExyToken.new(accounts[0], accounts[1], accounts[2]);
    assert.equal(await exy.balanceOf(accounts[0]), 0, "We should have 0 tokens at the beginning");

    await exy.proposeCompanySplit.sendTransaction(accounts[0], 1);
    await exy.approveCompanySplit.sendTransaction(accounts[0], fromAddress1);
    await exy.proposePartnerSplit.sendTransaction(accounts[0], 2);
    await exy.approvePartnerSplit.sendTransaction(accounts[0], fromAddress1);
    await exy.claimTokens.sendTransaction();
    assert.equal(await exy.balanceOf(accounts[0]), 0, "We should still have no tokens because 0 periods have elapsed");
  });

});
