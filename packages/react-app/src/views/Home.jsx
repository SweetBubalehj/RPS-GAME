import { useContractReader } from "eth-hooks";
import React from "react";
import { Divider } from "antd";

import rpsPNG from "../images/RPS.png";

/**
 * web3 props can be passed from '../App.jsx' into your local view component for use
 * @param {*} yourLocalBalance balance on current network
 * @param {*} readContracts contracts from current chain already pre-loaded using ethers contract module. More here https://docs.ethers.io/v5/api/contract/contract/
 * @returns react component
 **/
function Home({ yourLocalBalance, readContracts }) {
  // you can also use hooks locally in your component of choice
  // in this case, let's keep track of 'purpose' variable from our contract
  const purpose = useContractReader(readContracts, "Rps", "purpose");

  return (
    <div style={{ marginTop: 20 }}>
      <h1>Welcome!</h1>
      <img style={{ height: 500 }} src={rpsPNG} alt="rps image" />
      <Divider />
      <a style={{ marginTop: 20, fontSize: 25 }}>
        <b style={{ color: "#52c41a" }}>GREEN </b>= Win |<b style={{ color: "#f5222d" }}> RED </b>= Lose |
        <b style={{ color: "#faad14" }}> YELLOW </b>= Tie
      </a>
    </div>
  );
}

export default Home;
