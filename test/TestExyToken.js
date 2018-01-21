const ExyToken = artifacts.require('ExyToken');

contract('ExyToken', accounts => {
  let exy;

  it('should initialize ExyToken', async () => {
    exy = await ExyToken.new(accounts[0], accounts[1], accounts[2]);
    assert.equal(await exy.getCompanyAllocationListLength.call(), 5, 'should be mocked value');
  });

});
