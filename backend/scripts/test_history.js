import { ethers } from 'ethers';

const ALCHEMY_BASE = "https://eth-mainnet.g.alchemy.com/v2/OKm_BKQN5wzuIXCt0Mtwz".replace('mainnet', 'sepolia');
const address = "0xF39E2c522c53C4e0bD67CE84d95868CdFcb91B86";

async function test() {
    const fetchTransfers = async (isFrom) => {
      const payload = {
        jsonrpc: "2.0",
        id: 1,
        method: "alchemy_getAssetTransfers",
        params: [{
          fromBlock: "0x0",
          toBlock: "latest",
          [isFrom ? "fromAddress" : "toAddress"]: address,
          category: ["external", "internal", "erc20"],
          maxCount: "0x15"
        }]
      };
      
      const r = await fetch(ALCHEMY_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await r.json();
      console.log(data);
      return data?.result?.transfers || [];
    };

    const sentTxs = await fetchTransfers(true);
    const rcvTxs = await fetchTransfers(false);
    console.log("Sent", sentTxs.length, "Received", rcvTxs.length);
}
test();
