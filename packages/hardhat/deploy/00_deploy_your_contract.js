// deploy/00_deploy_your_contract.js

const { ethers } = require("hardhat");
const { utils } = require("mocha");

const localChainId = "31337";

// const sleep = (ms) =>
//   new Promise((r) =>
//     setTimeout(() => {
//       console.log(`waited for ${(ms / 1000).toFixed(3)} seconds`);
//       r();
//     }, ms)
//   );

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  const contract = await deploy("Rps", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    args: [ ethers.utils.parseEther('0.01'), ethers.utils.parseEther('1'), 2587 ],
    log: true,
  });

  // Getting a previously deployed contract
  // const YourContract = await ethers.getContract("Rps", deployer);
  // subscript ID = 2587
  //If you want to send value to an address from the deployer
  // const deployerWallet = ethers.provider.getSigner()
  // await deployerWallet.sendTransaction({
  //   to: contract.address,
  //   value: ethers.utils.parseEther("100")
  // })



  /*
  //If you want to send some ETH to a contract on deploy (make your constructor payable!)
  const yourContract = await deploy("YourContract", [], {
  value: ethers.utils.parseEther("0.05")
  });
  */

  /*
  //If you want to link a library into your contract:
  // reference: https://github.com/austintgriffith/scaffold-eth/blob/using-libraries-example/packages/hardhat/scripts/deploy.js#L19
  const yourContract = await deploy("YourContract", [], {}, {
   LibraryName: **LibraryAddress**
  });
  */

  // Verify from the command line by running `yarn verify`

  // You can also Verify your contracts with Etherscan here...
  // You don't want to verify on localhost
  // try {
  //   if (chainId !== localChainId) {
  //     await run("verify:verify", {
  //       address: contract.address,
  //       contract: "contracts/Rps.sol:Rps",
  //       constructorArguments: [ ethers.utils.parseEther('0.01'), ethers.utils.parseEther('1'), 2587 ],
  //     });
  //   }
  // } catch (error) {
  //   console.error(error);
  // }
};
module.exports.tags = ["YourContract"];
