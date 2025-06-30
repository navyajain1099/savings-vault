# 💰 SavingsVault: Gamified Onchain ETH Saving with Monthly Lottery

> *"Save Smart. Earn Fairly. Win Randomly."*

![License](https://img.shields.io/badge/license-MIT-green)
![Chainlink](https://img.shields.io/badge/Chainlink-VRF%2BAutomation-blue)
![Built with Foundry](https://img.shields.io/badge/Built%20With-Foundry-%23ef6c00)

---

## 🌟 Overview

**SavingsVault** is a decentralized Ethereum-based savings protocol that gamifies personal finance. Users deposit ETH into a vault with a lock-in period. Every 30 days, one of the eligible savers is randomly selected via **Chainlink VRF** and rewarded. The winner is picked automatically using **Chainlink Automation**, ensuring a completely fair and trustless mechanism.

The platform encourages savings with the thrill of lottery, backed by transparency, automation, and decentralization.

---

## 🔗 Chainlink Services Used

| Chainlink Feature        | Use Case                                             |
| ------------------------ | ---------------------------------------------------- |
| **VRF v2.5**             | Fair and verifiable lottery winner selection         |
| **Automation (Keepers)** | Automatically triggers the lottery once 30 days pass |
| **Price Feeds**          | Enforce a minimum USD value during deposit           |
| **Planned: CCIP**        | Cross-chain vault extension and reward distribution  |
| **Planned: Functions**   | External API data for dynamic interest-based rewards |

---

## 📌 Key Features

* 💸 **Save ETH securely** with a lock-in period
* 🎲 **Win monthly rewards** through a provably fair lottery
* 🤖 **Fully automated** using Chainlink Automation
* 📈 **View personal vault stats**: balance, transactions, lock period
* 🏆 **Leaderboard and transparency** for top savers and winners
* 🧱 **Smart contract-based system** with full decentralization
* 🎨 **Modern, animated frontend** with a dark theme and multi-page navigation

---

## 🧠 Why Onchain Finance?

SavingsVault transforms traditional savings behavior by leveraging:

* **On-chain enforcement** of lock-in savings and withdrawals
* **Transparency and fairness** using Chainlink VRF for random winner generation
* **No central control**, eliminating trust assumptions
* **Automation**, ensuring timely lottery draws without manual triggers

This makes savings safer, more engaging, and participatory.

---

## 🎮 Frontend Walkthrough

* **Page 1 - Landing**

  * Connect wallet, app logo, and brief project intro

* **Page 2 - User Vault**

  * Deposit ETH, set lock period, view vault stats, withdraw
  * See transaction count and real-time contract state

* **Page 3 - Extras**

  * 🎯 **Leaderboard:** Ranked list of savers
  * 🎁 **Lottery Info:** Past winners, rewards
  * 📚 **Know More:** Chainlink integrations and protocol logic

---

## 🛠 Tech Stack

* **Smart Contracts:** Solidity, Chainlink, Foundry
* **Frontend:** HTML, CSS, JavaScript, Ethers.js
* **Testing:** Anvil + Foundry unit tests
* **Deployment:** Custom `forge script` flows with Sepolia testnet

---

## 🧩 Architecture

```text
 User ↔ Frontend ↔ SavingsVault.sol ↔ Lottery.sol
                    ↑                  ↖
             Chainlink Feeds      Chainlink VRF + Automation
```

---

## 🧗‍♀️ Challenges Faced

### 1. VRF Revert Debugging

Understanding how to properly fund and register consumers with `VRFCoordinatorV2_5Mock` was tricky. I initially tried to test VRF in Anvil without wiring it correctly. Solved by using real mocks and Chainlink subscription workflows.

### 2. Git CI Failure

GitHub Actions failed due to a missing `.gitmodules` reference to `solmate`. I had to clean submodules and configure `.gitignore` to avoid pushing large library folders.

### 3. Deployment Sync

Ensuring the right addresses in deployment (i.e., setting SavingsVault address in Lottery) required attention since both contracts are decoupled. Handled via `.env` and helper config abstraction.

### 4. Frontend-Backend Sync

Frontend had difficulty reflecting contract changes (e.g., recent savers). Resolved by adding detailed event logs and using `getSavers()` more effectively.

---

## 📦 How to Run Locally

### Prerequisites

* Node.js
* Foundry (`curl -L https://foundry.paradigm.xyz | bash`)
* MetaMask / Sepolia ETH

### Clone and Install

```bash
git clone https://github.com/navyajain1099/savings-vault.git
cd savings-vault
forge install
forge build
```

### Run Local Tests

```bash
forge test
```

### Deploy to Sepolia

```bash
forge script script/DeploySavingsVault.s.sol:DeploySavingsVault --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY --broadcast
```

### Fund and Add Consumer (VRF)

```bash
forge script script/Interactions.s.sol:AddConsumer --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY --broadcast
```

---

## 🚀 Future Roadmap

* 💰 **Dynamic reward calculation** based on amount saved
* 🔗 **Cross-chain savings vault** via Chainlink CCIP
* 📊 **Analytics dashboard** with user and vault stats
* 🌎 **More lottery games** with tiers and bonus draws
* 📬 **Email + push notification integration** for winner alerts
* 🧠 **AI-powered recommendation engine** (vault vs. stake)

---

## 📹 Submission Video (Hackathon)

> 1.5 mins: Idea, how blockchain + Chainlink is used
> 2 mins: Live frontend demo with deposit, leaderboard, withdrawal
> Outro: Challenges and future scope

*Link will be added after upload.*

---

## 🙋‍♀️ Built By

**Navya Jain**
Chainlink Hackathon – *Onchain Finance Track*

* GitHub: [@navyajain1099](https://github.com/navyajain1099)
* Twitter: [@navya\_jain\_dev](https://twitter.com/navya_jain_dev) *(if applicable)*

---

## 📄 License

MIT License

---

## ✨ Final Words

> SavingsVault isn't just another DeFi dApp. It's a creative nudge to make saving feel fun, social, and rewarding. With verifiable randomness, complete automation, and the power of Chainlink, the system runs itself — fairly and transparently.

### 🔗 [View the Full Project Repository](https://github.com/navyajain1099/savings-vault)

---
