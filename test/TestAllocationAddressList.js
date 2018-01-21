const AllocationAddressList = artifacts.require('AllocationAddressList');

contract('AllocationAddressList', accounts => {
  let allocationAddressList;

  it('should initialize allocation addresses list', async () => {
    list = await AllocationAddressList.new();

    await list.push.sendTransaction(accounts[0]);
    let listElement = await list.allocationAddressList.call(0);
    assert.equal(listElement, accounts[0], 'accounts[0] should be added to list');

    await list.push.sendTransaction(accounts[1]);
    listElement = await list.allocationAddressList.call(1);
    assert.equal(listElement, accounts[1], 'accounts[1] should be added to list');

  });

});
