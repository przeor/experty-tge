const ExpertyToken = artifacts.require('ExpertyToken');
const web3 = ExpertyToken.web3;

contract('ExpertyToken', accounts => {
  let token;
  it("should initialize experty token", async () => {
    //TODO: fix it.
    token = await ExpertyToken.new();
    const contractManager = await token.address;
    assert.equal(accounts[0], contractManager, 'Contract manager not equal to first account')
  });
  it("should test add contribution", async () => {
    //TODO: fix it.
    token = await ExpertyToken.new();
    const balanceBefore = await getBalance(token.address);
    await token.addContribution.call(token.address, 1000);
    const balanceAfter = await getBalance(token.address);
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
