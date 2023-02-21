# 🏗 RPS on-chain game with Oracle!

## Already deployed and verified contract on BSC Testnet: [0xcd7d31435cA97D2ddf3833e7868e578a32E745dE](https://testnet.bscscan.com/address/0xcd7d31435ca97d2ddf3833e7868e578a32e745de)


> Built using open-source Web3 workshop [scaffold-eth](https://github.com/scaffold-eth/scaffold-eth.git)
# 🏄‍♂️ Quick Start

Prerequisites: [Node (v18 LTS)](https://nodejs.org/en/download/) plus [Yarn (v1.x)](https://classic.yarnpkg.com/en/docs/install/) and [Git](https://git-scm.com/downloads)

🚨 If you are using a version < v18 you will need to remove `openssl-legacy-provider` from the `start` script in `package.json`

> 1️⃣ clone the repository and install dependency:

```bash
yarn install
```

> 2️⃣ Configure the `.env` in `packages/hardhat/` according to `example.env`

> 3️⃣ Deploy contract to BSC Testnet using this command:

```bash
yarn deploy --network bscTest
```


> 4️⃣ In a second terminal window, start your 📱 frontend:

```bash
yarn start
```

