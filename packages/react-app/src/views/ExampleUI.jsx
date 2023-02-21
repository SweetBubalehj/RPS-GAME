import { Button, Divider, Progress, Avatar, Segmented, InputNumber, Space } from "antd";

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

import rockPNG from "../images/rock.png";
import paperPNG from "../images/paper.png";
import scissorsPNG from "../images/scissors.png";

export default function ExampleUI({ status, winners, reward, tx, writeContracts }) {
  const toWei = value => ethers.utils.parseEther(value.toString());

  const fromWei = value => ethers.utils.formatEther(typeof value === "string" ? value : value.toString());

  const [isDivVisible, setIsDivVisible] = useState(true);
  const [rounds, setRounds] = useState(1);
  const [amount, setAmount] = useState(0.01);
  const [selectedOption, setSelectedOption] = useState(1);
  const [isRewardVisible, setIsRewardVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  function timeout(delay) {
    return new Promise(res => setTimeout(res, delay));
  }

  // Define color codes for different status
  const colors = {
    0: "#d3d3d3", // nothing: grey
    1: "#f5222d", // loss: red
    2: "#52c41a", // win: green
    3: "#faad14", // tie: yellow
  };

  // Calculate the progress value and color based on the winners array
  const calculateProgress = () => {
    const sections = winners.length;
    const progressData = [];

    for (let i = 0; i < sections; i++) {
      const status = winners[i];
      const color = colors[status];
      progressData.push({ percent: 100, strokeColor: color });
    }

    setProgress(progressData);
  };

  // Call the calculateProgress function whenever the winners array changes

  useEffect(() => {
    if (winners) calculateProgress();
    else return 0;
  }, [winners]);

  useEffect(async () => {
    if (status === 1) {
      setIsDivVisible(false);
    } else {
      await timeout(3000);
      setIsDivVisible(true);
    }
  }, [status]);

  useEffect(() => {
    if (reward > 0) {
      setIsRewardVisible(true);
    } else {
      setIsRewardVisible(false);
    }
  }, [reward]);

  const handleRoundsChange = value => {
    setRounds(value);
  };

  const handleOptionChange = value => {
    setSelectedOption(value);
  };

  return (
    <div>
      <div
        style={{
          padding: 30,
          border: "1px solid #d3d3d3",
          borderRadius: 5,
          width: 500,
          height: 530,
          margin: "0 auto",
          marginTop: 30,
        }}
      >
        {isDivVisible && (
          <form>
            <Segmented
              style={{ fontWeight: "bold", marginBottom: 10 }}
              value={rounds}
              onChange={handleRoundsChange}
              options={[
                {
                  label: (
                    <div style={{ padding: 8 }}>
                      <Avatar style={{ backgroundColor: "#f56a00" }}>1</Avatar>
                      <div>Best of 1</div>
                    </div>
                  ),
                  value: 1,
                },
                {
                  label: (
                    <div style={{ padding: 8 }}>
                      <Avatar style={{ backgroundColor: "#4287f5" }}>2</Avatar>
                      <div>Best of 2</div>
                    </div>
                  ),
                  value: 3,
                },
                {
                  label: (
                    <div style={{ padding: 8 }}>
                      <Avatar style={{ backgroundColor: "#87d068" }}>3</Avatar>
                      <div>Best of 3</div>
                    </div>
                  ),
                  value: 5,
                },
              ]}
            />
            <br />
            {selectedOption === 1 && <img style={{ height: 150 }} src={rockPNG} alt="rock image" />}
            {selectedOption === 2 && <img style={{ height: 150 }} src={paperPNG} alt="paper image" />}
            {selectedOption === 3 && <img style={{ height: 150 }} src={scissorsPNG} alt="scissors image" />}
            <br />
            <Segmented
              style={{ fontWeight: "bold", marginTop: 10 }}
              value={selectedOption}
              onChange={handleOptionChange}
              options={[
                {
                  label: (
                    <div
                      style={{
                        padding: 4,
                      }}
                    >
                      <div>Rock</div>
                    </div>
                  ),
                  value: 1,
                },
                {
                  label: (
                    <div
                      style={{
                        padding: 4,
                      }}
                    >
                      <div>Paper</div>
                    </div>
                  ),
                  value: 2,
                },
                {
                  label: (
                    <div
                      style={{
                        padding: 4,
                      }}
                    >
                      <div>Scissors</div>
                    </div>
                  ),
                  value: 3,
                },
              ]}
            />
            <br />
            <Space style={{ marginTop: 30 }}>
              <b>BNB Amount:</b>
              <InputNumber min={0.01} max={1} step={0.01} value={amount} onChange={setAmount} />
            </Space>
            <Divider />
            <Button
              type="danger"
              style={{ fontSize: 30, height: 70 }}
              onClick={async () => {
                const result = tx(writeContracts.Rps.createGame(rounds, selectedOption, { value: toWei(amount) }));
                console.log("awaiting metamask/web3 confirm result...", result);
                console.log(await result);
              }}
            >
              Let's Play
            </Button>
            <br />
          </form>
        )}
        {!isDivVisible && (
          <form>
            <div style={{ display: "flex", marginTop: 10 }}>
              {winners &&
                Array.isArray(progress) &&
                progress.map((item, index) => (
                  <Progress
                    style={{ padding: 5, height: 50 }}
                    showInfo={false}
                    key={index}
                    percent={item.percent}
                    status="active"
                    strokeColor={item.strokeColor}
                  />
                ))}
            </div>
            <Divider style={{ marginBottom: 40 }} />
            {selectedOption === 1 && <img style={{ height: 150 }} src={rockPNG} alt="rock image1" />}
            {selectedOption === 2 && <img style={{ height: 150 }} src={paperPNG} alt="paper image1" />}
            {selectedOption === 3 && <img style={{ height: 150 }} src={scissorsPNG} alt="scissors image1" />}
            <br />
            <Segmented
              style={{ fontWeight: "bold", marginTop: 10 }}
              value={selectedOption}
              onChange={handleOptionChange}
              options={[
                {
                  label: (
                    <div
                      style={{
                        padding: 4,
                      }}
                    >
                      <div>Rock</div>
                    </div>
                  ),
                  value: 1,
                },
                {
                  label: (
                    <div
                      style={{
                        padding: 4,
                      }}
                    >
                      <div>Paper</div>
                    </div>
                  ),
                  value: 2,
                },
                {
                  label: (
                    <div
                      style={{
                        padding: 4,
                      }}
                    >
                      <div>Scissors</div>
                    </div>
                  ),
                  value: 3,
                },
              ]}
            />
            <Divider style={{ marginTop: 40, marginBottom: 40 }} />
            <Button
              type="danger"
              style={{ fontSize: 30, height: 70 }}
              onClick={async () => {
                const result = tx(writeContracts.Rps.playRound(selectedOption));
                console.log("awaiting metamask/web3 confirm result...", result);
                console.log(await result);
              }}
            >
              Confirm Option
            </Button>
          </form>
        )}
      </div>
      {isRewardVisible && (
        <div
          style={{
            padding: 20,
            height: 80,
            marginTop: 10,
          }}
        >
          <a>
            Your reward is
            <b style={{ marginLeft: 5 }}>{fromWei(reward)} BNB</b>
          </a>

          <Button
            type="primary"
            style={{ fontSize: 15, height: 40, marginLeft: 10 }}
            onClick={async () => {
              const result = tx(writeContracts.Rps.claimReward());
              console.log("awaiting metamask/web3 confirm result...", result);
              console.log(await result);
            }}
          >
            Claim Reward
          </Button>
        </div>
      )}

      {/*
        📑 Maybe display a list of events?
          (uncomment the event and emit line in Rps.sol! )
            */}
      {/* <Events
        contracts={readContracts}
        contractName="Rps"
        eventName="GameFinished"
        localProvider={localProvider}
        mainnetProvider={mainnetProvider}
        startBlock={1}
      /> */}
    </div>
  );
}
