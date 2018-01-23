const ExyToken = artifacts.require('ExyToken');

const TOKENS_PER_PERIOD = 0;

const AllocationState = {
  proposed: 0,
  approved: 1,
  rejected: 2
}

contract('ExyToken', accounts => {
  let exy;
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
    assert.equal(await exy.getBountyAllocationListLength.call(), 0, 'should be mocked value');
  });

  it('should propose company allocation', async () => {
    exy = await ExyToken.new(accounts[0], accounts[1], accounts[2]);
    await exy.proposeCompanyAllocation.sendTransaction(accounts[3], 100, { from: accounts[0] });
    await exy.approveCompanyAllocation.sendTransaction(accounts[3], fromAddress1);

    let allocation = await exy.getCompanyAllocation.call(0);

    assert.equal(allocation[TOKENS_PER_PERIOD], 100, 'Allocation should be set to 100');
    assert.equal(allocation[1], accounts[0], 'Proposal address should be set to accounts[0]');
    assert.equal(allocation[2], 0, 'claimedPeriods should be 0');
    assert.equal(allocation[3], AllocationState.approved, 'AllocationState should be approved');
    assert.equal(allocation[4], accounts[3], 'Destinantion address shuld be equal accounts[3]');
  });

  it('should not invoke company proposal because I am not a signaturer', async () => {
    exy = await ExyToken.new(accounts[0], accounts[1], accounts[2]);
    // Testing if an error appears
    let err = null
    try {
      await exy.proposeCompanyAllocation.sendTransaction(address3, 100, { from: address4 });
    } catch (error) {
      err = error
    }
    assert.ok(err instanceof Error);
  });

  it('should not invoke company approval because I am not a signaturer', async () => {
    exy = await ExyToken.new(accounts[0], accounts[1], accounts[2]);
    await exy.proposeCompanyAllocation.sendTransaction(address3, 100);
    // Testing if an error appears
    let err = null
    try {
      await exy.approveCompanyAllocation.sendTransaction(address5, { from: address3 });
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

    await exy.proposeCompanyAllocation.sendTransaction(accounts[3], 50);
    await exy.proposeCompanyAllocation.sendTransaction(accounts[4], 20);

    let err = null
    try {
      await exy.proposeCompanyAllocation.sendTransaction(accounts[5], 31);
    } catch (error) {
      err = error
    }
    assert.ok(err instanceof Error);
  });

  it('should update company allocation list', async () => {
    exy = await ExyToken.new(accounts[0], accounts[1], accounts[2]);
    assert.equal(await exy.getCompanyAllocationListLength.call(), 0, "List should be empty");
    await exy.proposeCompanyAllocation.sendTransaction(accounts[0], 50);
    assert.equal(await exy.getCompanyAllocationListLength.call(), 1, "We should have one element");
  });

  it('should update partner allocation list', async () => {
    exy = await ExyToken.new(accounts[0], accounts[1], accounts[2]);
    assert.equal(await exy.getPartnerAllocationListLength.call(), 0, "List should be empty");
    await exy.proposePartnerAllocation.sendTransaction(accounts[0], 50);
    assert.equal(await exy.getPartnerAllocationListLength.call(), 1, "We should have one element");
  });

  it('should update bounty allocation list', async () => {
    exy = await ExyToken.new(accounts[0], accounts[1], accounts[2]);
    assert.equal(await exy.getBountyAllocationListLength.call(), 0, "List should be empty");
    await exy.proposeBountyTransfer.sendTransaction(accounts[0], 50);
    assert.equal(await exy.getBountyAllocationListLength.call(), 1, "We should have one element");
  });

});
