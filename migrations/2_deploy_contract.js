const Dice2Win = artifacts.require("Dice2Win");

module.exports = async function(deployer, network, accounts) {

    deployer.deploy(Dice2Win).then(async () => {
        dice2win = await Dice2Win.deployed();
        console.log(`dice2win deployed at address: ${dice2win.address}`);

        await dice2win.setSecretSigner(accounts[0]);
        await dice2win.setCroupier(accounts[0]);
        await dice2win.setMaxProfit(1000 * 1e18);

        var message = {from: accounts[0], to:dice2win.address, value: web3.toWei(1000, 'ether')};

        await web3.eth.sendTransaction(message, (err, res) => {
            var output = "";
            if (!err) {
                output += res;
            } else {
                output = "Error";
            }
        })

        var balance = await web3.eth.getBalance(dice2win.address);
        console.log(balance);
    });
};

