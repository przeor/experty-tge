const ExpertyToken = artifacts.require('./ExpertyToken');

contract('ExpertyToken', accounts => {
  let instance = null;
  beforeEach(async () => instance = await ExpertyToken.new());
  afterEach(() => instance = null);

  it('should deposit 1000 coins in the first account', async () => {
    const balanceBeforeDeposit = await instance.balanceOf.then(balance => balance);
    await instance.deposit({ value: 1000 });
    const balanceAfterDeposit = await instance.balanceOf.then(balance => balance);
    assert.equal(balanceAfterDeposit, balanceBeforeDeposit + 1000);
  });

  it('should withdraw the requested amount', async () => {
    await instance.deposit({ value: 1000 });
    await instance.withdraw(500);
    const balanceAfterWithdrawal = await instance.getBalance.balanceOf.then(balance => balance);
    assert.equal(balanceAfterWithdrawal, 500)
  });

  it('should not allow withdraw more than deposited value', async () => {
    await instance.deposit({ value: 500 });
    await instance
      .withdraw(1000)
      .then(tx => { throw new Error() })
      .catch(e => assert(e instanceof Error))
  });
});
