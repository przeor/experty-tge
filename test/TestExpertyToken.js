const ExpertyToken = artifacts.require('ExpertyToken');
const web3 = ExpertyToken.web3;

contract('ExpertyToken', accounts => {
  let token;
  it("should initialize experty token", async () => {
    //TODO: test other parameters of constructor.
    token = await ExpertyToken.new();
    const contractManager = await token.contractManager.call();
    assert.equal(accounts[0], contractManager, 'Contract manager not equal to first account')
  });
  it("should add contribution, total supply increasing by 1000", async () => {
    const initialSupply = await token.totalSupply.call();
    const initialContributionValue = await token.contributions.call(accounts[1]);
    // Ask about adding contributions to two different allocations
    await token.addContribution.sendTransaction(accounts[1], 1000);
    const supplyAfterFirstContibution = await token.totalSupply.call();
    const contributionValueFirstAdd = await token.contributions.call(accounts[1]);
    assert(supplyAfterFirstContibution.eq(initialSupply.add(1000)), 'Total supply was not increased');
    assert(contributionValueFirstAdd.eq(initialContributionValue.add(1000)), 'Contributions value was not increased');
    // add contribution from the same address
    await token.addContribution.sendTransaction(accounts[1], 100);
    const supplyAfterSecondContibution = await token.totalSupply.call();
    const contributionValueSecondAdd = await token.contributions.call(accounts[1]);
    assert(supplyAfterSecondContibution.eq(supplyAfterFirstContibution.add(100)), 'Total supply was not increased');
    assert(contributionValueSecondAdd.eq(contributionValueFirstAdd.add(100)), 'Contributions value was not increased after second add');
  });
  it("should increase total supply after add partner allocation", async () => {
    const initialSupply = await token.totalSupply.call();
    await token.addPartnersAllocation.sendTransaction(accounts[2], 200, 10, 1);
    const supplyAfterFirstAllocation = await token.totalSupply.call();
    assert(supplyAfterFirstAllocation.eq(initialSupply.add(2000)), 'Total supply not increased');
  })
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
