const ExpertyToken = artifacts.require('ExpertyToken');
const web3 = ExpertyToken.web3;

contract('ExpertyToken', accounts => {
  let token;
  it("should initialize experty token", async () => {
    //TODO: test other parameters of constructor.
    token = await ExpertyToken.new();
    const contractManager = await token.contractManager.call();
    assert.equal(accounts[0], contractManager, 'Contract manager not equal to first account')
    const name = await token.name.call();
    assert.equal('Experty Token', name, 'Contract name is not equal to ExpertyToken')
    const symbol = await token.symbol.call();
    assert.equal('EXY', symbol, 'Contract symbol is not equal to EXY')
    const decimals = await token.decimals.call();
    assert.equal(18, decimals, 'Contract decimals is not equal to 18')
    const totalSupply = await token.totalSupply.call();
    assert.equal(0, totalSupply, 'Contract totalSupply is not equal to 0')
    const circulatingSupply = await token.circulatingSupply.call();
    assert.equal(0, circulatingSupply, 'Contract circulatingSupply is not equal to 0')
  });
  it("should add contribution, total supply increasing by 1000", async () => {
    const initialSupply = await token.totalSupply.call();
    const initialContributorTokens = await token.contributions.call(accounts[1]);
    // Ask about adding contributions to two different allocations
    await token.addContribution.sendTransaction(accounts[1], 1000);
    const supplyAfterFirstContibution = await token.totalSupply.call();
    const contributorTokens = await token.contributions.call(accounts[1]);
    assert(supplyAfterFirstContibution.eq(initialSupply.add(1000)), 'Total supply was not increased');
    assert(contributorTokens.eq(initialContributorTokens.add(1000)), 'Contributions value was not increased');
    // add contribution from the same address
    await token.addContribution.sendTransaction(accounts[1], 100);
    const supplyAfterSecondContibution = await token.totalSupply.call();
    const contributorsTokens2 = await token.contributions.call(accounts[1]);
    assert(supplyAfterSecondContibution.eq(supplyAfterFirstContibution.add(100)), 'Total supply was not increased');
    assert(contributorsTokens2.eq(contributorTokens.add(100)), 'Contributions value was not increased after second add');
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
