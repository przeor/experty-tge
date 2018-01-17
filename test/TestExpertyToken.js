const ExpertyToken = artifacts.require('./contracts/ExpertyToken');
const web3 = global.web3;

contract('ExpertyToken', accounts => {
  it("should test add contribution", async () => {
    //TODO: fix it.
    const token = await ExpertyToken.new();
    const balanceBefore = await getBalance(accounts[0]);
    await token.addContribution.call(accounts[0], 1000);
    const balanceAfter = await getBalance(accounts[0]);
    assert(balanceAfter.eq(balanceBefore.add(1000)), 'Not add contribution');
  });
});

const getBalance = async (account) => {
  return new Promise((resolve, reject) => {
    web3.eth.getBalance(account, (error, balance) => {
      if (error) {
        reject(error);
      } else {
        resolve(balance);
      }
    })
  })
};
