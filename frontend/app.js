// Global variables
let web3;
let accounts = [];
let savingsVaultContract;
let lotteryContract;
let isDemoMode = false;
let currentNetwork = null;
let transactionCounter = 0;
let recentTransactions = [];

// Demo data for lottery stats
const demoLotteryData = {
    prizePool: 0.125,
    players: 47,
    nextDraw: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    recentWinner: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    totalSavings: 2.847,
    activeSavers: 23,
    pastWinners: [
        { address: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6", amount: 0.125, date: "2024-01-15", rank: 1 },
        { address: "0x8ba1f109551bD432803012645Hac136c772c3c3", amount: 0.098, date: "2024-01-08", rank: 2 },
        { address: "0x147B8eb97fD247D06C4006D269c90C1908Fb5D54", amount: 0.087, date: "2024-01-01", rank: 3 },
        { address: "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db", amount: 0.076, date: "2023-12-25", rank: 4 },
        { address: "0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB", amount: 0.065, date: "2023-12-18", rank: 5 },
        { address: "0x617F2E2fD72FD9D5503197092aC168c91465E7f2", amount: 0.054, date: "2023-12-11", rank: 6 }
    ],
    leaderboard: [
        { address: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6", amount: 0.847, rank: 1 },
        { address: "0x8ba1f109551bD432803012645Hac136c772c3c3", amount: 0.623, rank: 2 },
        { address: "0x147B8eb97fD247D06C4006D269c90C1908Fb5D54", amount: 0.498, rank: 3 },
        { address: "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db", amount: 0.387, rank: 4 },
        { address: "0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB", amount: 0.298, rank: 5 },
        { address: "0x617F2E2fD72FD9D5503197092aC168c91465E7f2", amount: 0.234, rank: 6 },
        { address: "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2", amount: 0.187, rank: 7 },
        { address: "0x4c20993Bc481177ec7E8f571ceCaE8A9e22C02db", amount: 0.156, rank: 8 },
        { address: "0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB", amount: 0.134, rank: 9 },
        { address: "0x617F2E2fD72FD9D5503197092aC168c91465E7f2", amount: 0.098, rank: 10 }
    ]
};

// Contract addresses - loaded from environment
let CONTRACT_ADDRESSES = {
    sepolia: { savingsVault: null, lottery: null },
    local: { savingsVault: null, lottery: null }
};

// Contract ABIs from compiled contracts
const SAVINGS_VAULT_ABI = [
    { "type": "constructor", "inputs": [{ "name": "priceFeed", "type": "address", "internalType": "address" }], "stateMutability": "nonpayable" },
    { "type": "function", "name": "addYourSavings", "inputs": [{ "name": "lockPeriod", "type": "uint256", "internalType": "uint256" }], "outputs": [], "stateMutability": "payable" },
    { "type": "function", "name": "getAmountSavedByASaver", "inputs": [{ "name": "saver", "type": "address", "internalType": "address" }], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" },
    { "type": "function", "name": "getSavers", "inputs": [], "outputs": [{ "name": "", "type": "address[]", "internalType": "address[]" }], "stateMutability": "view" },
    { "type": "function", "name": "getTotalBalance", "inputs": [], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" },
    { "type": "function", "name": "withdraw", "inputs": [{ "name": "amountToBeWithdrawn", "type": "uint256", "internalType": "uint256" }], "outputs": [], "stateMutability": "nonpayable" },
    { "type": "event", "name": "AddedSavingsEvent", "inputs": [{ "name": "amount", "type": "uint256", "indexed": true, "internalType": "uint256" }, { "name": "saver", "type": "address", "indexed": true, "internalType": "address" }, { "name": "lockperiod", "type": "uint256", "indexed": true, "internalType": "uint256" }], "anonymous": false },
    { "type": "event", "name": "WithdrawnSavingsEvent", "inputs": [{ "name": "withdrawer", "type": "address", "indexed": true, "internalType": "address" }, { "name": "amountwithdrawn", "type": "uint256", "indexed": true, "internalType": "uint256" }], "anonymous": false }
];

const LOTTERY_ABI = [
    { "type": "constructor", "inputs": [{ "name": "vrfCoordinator", "type": "address", "internalType": "address" }, { "name": "keyHash", "type": "bytes32", "internalType": "bytes32" }, { "name": "subscriptionId", "type": "uint256", "internalType": "uint256" }, { "name": "callbackGasLimit", "type": "uint32", "internalType": "uint32" }, { "name": "savingsVaultAddress", "type": "address", "internalType": "contract SavingsVault" }], "stateMutability": "nonpayable" },
    { "type": "function", "name": "getLotteryAmount", "inputs": [], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" },
    { "type": "function", "name": "getPlayers", "inputs": [], "outputs": [{ "name": "", "type": "address[]", "internalType": "address[]" }], "stateMutability": "view" },
    { "type": "function", "name": "getRecentWinner", "inputs": [], "outputs": [{ "name": "", "type": "address", "internalType": "address" }], "stateMutability": "view" },
    { "type": "function", "name": "getLastRunTimestamp", "inputs": [], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" },
    { "type": "function", "name": "getInterval", "inputs": [], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "pure" }
];

// Demo data for leaderboard past winners only
const demoLeaderboardWinners = [
    { address: "0x1234...5678", amount: "25.5", rank: 1, date: "2024-01-15" },
    { address: "0x8765...4321", amount: "18.2", rank: 2, date: "2024-01-10" },
    { address: "0xabcd...efgh", amount: "12.7", rank: 3, date: "2024-01-05" },
    { address: "0x9876...5432", amount: "8.9", rank: 4, date: "2024-01-01" },
    { address: "0x5678...1234", amount: "5.3", rank: 5, date: "2023-12-25" }
];

// Initialize the application
async function initApp() {
    console.log("🚀 Initializing Savings Vault App...");
    await loadContractAddresses();

    if (typeof window.ethereum !== 'undefined') {
        console.log("✅ MetaMask detected");
        await initializeWeb3();
    } else {
        console.log("⚠️ MetaMask not detected, running in demo mode");
        isDemoMode = true;
        initializeDemoMode();
    }

    initializeUI();
    setInterval(updateData, 30000);

    // Hide loading screen after initialization
    setTimeout(() => {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    }, 1000);
}

// Load contract addresses from environment
async function loadContractAddresses() {
    try {
        const response = await fetch('/api/contract-addresses');
        if (response.ok) {
            CONTRACT_ADDRESSES = await response.json();
            console.log("✅ Contract addresses loaded:", CONTRACT_ADDRESSES);
        } else {
            console.log("⚠️ Could not load contract addresses, using defaults");
            CONTRACT_ADDRESSES.sepolia.savingsVault = "0x0000000000000000000000000000000000000000";
            CONTRACT_ADDRESSES.sepolia.lottery = "0x0000000000000000000000000000000000000000";
        }
    } catch (error) {
        console.error("❌ Failed to load contract addresses:", error);
        CONTRACT_ADDRESSES.sepolia.savingsVault = "0x0000000000000000000000000000000000000000";
        CONTRACT_ADDRESSES.sepolia.lottery = "0x0000000000000000000000000000000000000000";
    }
}

// Initialize Web3 and MetaMask connection
async function initializeWeb3() {
    try {
        // Request account access
        accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log("✅ MetaMask connected:", accounts[0]);

        // Create Web3 instance
        web3 = new Web3(window.ethereum);

        // Get current chain ID
        const chainId = await web3.eth.getChainId();
        currentNetwork = getNetworkName(chainId);
        console.log("🌐 Connected to network:", currentNetwork);

        // Check if we have contract addresses for this network
        if (CONTRACT_ADDRESSES[currentNetwork] &&
            CONTRACT_ADDRESSES[currentNetwork].savingsVault !== "0x0000000000000000000000000000000000000000") {
            await initializeContracts();
            isDemoMode = false;
            console.log("✅ Contracts initialized, running in blockchain mode");
        } else {
            console.log("⚠️ No contract addresses for this network, running in demo mode");
            isDemoMode = true;
            initializeDemoMode();
        }

        // Set up event listeners
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);

        updateConnectionStatus();
        await updateData();

    } catch (error) {
        console.error("❌ Failed to initialize Web3:", error);
        isDemoMode = true;
        initializeDemoMode();
        throw error;
    }
}

// Initialize smart contracts
async function initializeContracts() {
    try {
        const networkConfig = CONTRACT_ADDRESSES[currentNetwork];
        savingsVaultContract = new web3.eth.Contract(SAVINGS_VAULT_ABI, networkConfig.savingsVault);
        lotteryContract = new web3.eth.Contract(LOTTERY_ABI, networkConfig.lottery);
        console.log("✅ Contracts initialized successfully");
    } catch (error) {
        console.error("❌ Failed to initialize contracts:", error);
        throw error;
    }
}

// Get network name from chain ID
function getNetworkName(chainId) {
    switch (chainId) {
        case 11155111: return 'sepolia';
        case 31337: return 'local';
        default: return 'unknown';
    }
}

// Handle account changes
async function handleAccountsChanged(newAccounts) {
    if (newAccounts.length === 0) {
        accounts = [];
        updateConnectionStatus();
    } else {
        accounts = newAccounts;
        updateConnectionStatus();
        await updateData();
    }
}

// Handle chain changes
async function handleChainChanged(chainId) {
    window.location.reload();
}

// Initialize demo mode
function initializeDemoMode() {
    isDemoMode = true;
    updateConnectionStatus();
}

// Update connection status in UI
function updateConnectionStatus() {
    const statusElement = document.getElementById('connection-status');
    const connectButton = document.getElementById('connect-button');
    const networkNameElement = document.getElementById('networkName');
    const currentModeElement = document.getElementById('current-mode');

    if (isDemoMode) {
        statusElement.textContent = "Demo Mode";
        statusElement.className = "status demo";
        connectButton.innerHTML = '<span class="btn-text">Connect MetaMask</span><div class="btn-glow"></div>';
        connectButton.onclick = connectMetaMask;
        if (networkNameElement) {
            networkNameElement.textContent = "Demo";
        }
        if (currentModeElement) {
            currentModeElement.textContent = "Demo Mode";
            currentModeElement.className = "text-lg font-bold text-yellow-400";
        }
    } else {
        statusElement.textContent = `Connected: ${accounts[0]?.slice(0, 6)}...${accounts[0]?.slice(-4)}`;
        statusElement.className = "status connected";
        connectButton.innerHTML = '<span class="btn-text">Disconnect</span><div class="btn-glow"></div>';
        connectButton.onclick = disconnectMetaMask;
        if (networkNameElement) {
            networkNameElement.textContent = currentNetwork || "Unknown";
        }
        if (currentModeElement) {
            currentModeElement.textContent = "Blockchain Mode";
            currentModeElement.className = "text-lg font-bold text-green-400";
        }
    }
}

// Connect MetaMask
async function connectMetaMask() {
    try {
        if (typeof window.ethereum === 'undefined') {
            showToast("❌ MetaMask not installed. Please install MetaMask first.", "error");
            return;
        }

        showToast("⏳ Connecting to MetaMask...", "info");

        await initializeWeb3();

        if (!isDemoMode) {
            showToast("✅ Connected to blockchain! You can now make real transactions.", "success");
        } else {
            showToast("⚠️ Connected to MetaMask but running in demo mode (no contracts deployed on this network)", "info");
        }

    } catch (error) {
        console.error("❌ MetaMask connection failed:", error);

        if (error.code === 4001) {
            showToast("❌ MetaMask connection rejected by user", "error");
        } else if (error.code === -32002) {
            showToast("❌ MetaMask connection already pending. Please check MetaMask.", "error");
        } else {
            showToast("❌ Failed to connect MetaMask: " + error.message, "error");
        }
    }
}

// Disconnect MetaMask
function disconnectMetaMask() {
    accounts = [];
    isDemoMode = true;
    updateConnectionStatus();
    showToast("🔌 MetaMask disconnected", "info");
}

// Initialize UI elements
function initializeUI() {
    initializeNavigation();
    initializeDashboard();
    initializeLeaderboard();
    initializeAbout();
    initializeLotteryStats();

    // Add hero button handlers
    const heroConnectBtn = document.getElementById('hero-connect-button');
    if (heroConnectBtn) {
        heroConnectBtn.addEventListener('click', () => {
            showPage('dashboard');
            if (isDemoMode) {
                connectMetaMask();
            }
        });
    }

    // Add mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }

    // Show landing page by default
    showPage('landing');
    addConfettiEffect();
}

// Initialize navigation
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            console.log("🔄 Navigation clicked:", page);
            showPage(page);

            // Close mobile menu if open
            const mobileMenu = document.getElementById('mobile-menu');
            if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
            }
        });
    });
}

// Show specific page
function showPage(pageName) {
    console.log("🔄 Showing page:", pageName);

    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });

    // Show selected page
    const selectedPage = document.getElementById(pageName + 'Page');
    if (selectedPage) {
        selectedPage.classList.add('active');
        console.log("✅ Page displayed:", pageName);
    } else {
        console.error("❌ Page not found:", pageName + 'Page');
    }

    // Update navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => link.classList.remove('active'));
    const activeLink = document.querySelector(`[data-page="${pageName}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }

    // Load page data
    loadPageData(pageName);
}

// Load page-specific data
async function loadPageData(pageName) {
    console.log("📄 Loading data for page:", pageName);

    try {
        switch (pageName) {
            case 'dashboard':
                await updateDashboard();
                break;
            case 'lottery-stats':
                updateLotteryStatsPage();
                break;
            case 'leaderboard':
                await updateLeaderboard();
                break;
            case 'about':
                updateAbout();
                break;
            case 'landing':
                updateHeroData();
                break;
        }

        // Always update recent transactions
        await updateRecentTransactions();

    } catch (error) {
        console.error("❌ Error loading page data:", error);
    }
}

// Initialize dashboard
function initializeDashboard() {
    const addFundsForm = document.getElementById('add-funds-form');
    if (addFundsForm) {
        addFundsForm.addEventListener('submit', handleAddFunds);
    }

    const withdrawFundsForm = document.getElementById('withdraw-funds-form');
    if (withdrawFundsForm) {
        withdrawFundsForm.addEventListener('submit', handleWithdrawFunds);
    }
}

// Handle add funds
async function handleAddFunds(e) {
    e.preventDefault();

    const amount = document.getElementById('add-amount').value;
    const lockPeriod = document.getElementById('lock-period').value;

    if (!amount || amount <= 0) {
        showToast("❌ Please enter a valid amount", "error");
        return;
    }

    try {
        if (isDemoMode) {
            showToast("🎮 Demo Mode: Transaction simulated successfully!", "success");
            document.getElementById('add-amount').value = '';

            // Add to transaction history
            addTransaction('deposit', amount);

            // Update demo data to show the transaction
            setTimeout(() => {
                updateDemoData();
            }, 1000);
            return;
        } else {
            if (!accounts || accounts.length === 0) {
                showToast("❌ Please connect MetaMask first", "error");
                return;
            }
            await addFundsToContract(amount, lockPeriod);
        }
    } catch (error) {
        showToast("❌ Failed to add funds: " + error.message, "error");
    }
}

// Handle withdraw funds
async function handleWithdrawFunds(e) {
    e.preventDefault();

    const amount = document.getElementById('withdraw-amount').value;

    if (!amount || amount <= 0) {
        showToast("❌ Please enter a valid amount", "error");
        return;
    }

    try {
        if (isDemoMode) {
            showToast("🎮 Demo Mode: Withdrawal simulated successfully!", "success");
            document.getElementById('withdraw-amount').value = '';

            // Add to transaction history
            addTransaction('withdrawal', amount);

            // Update demo data to show the transaction
            setTimeout(() => {
                updateDemoData();
            }, 1000);
            return;
        } else {
            if (!accounts || accounts.length === 0) {
                showToast("❌ Please connect MetaMask first", "error");
                return;
            }
            await withdrawFundsFromContract(amount);
        }
    } catch (error) {
        showToast("❌ Failed to withdraw funds: " + error.message, "error");
    }
}

// Add funds to smart contract
async function addFundsToContract(amount, lockPeriod) {
    try {
        const amountWei = web3.utils.toWei(amount, 'ether');
        const lockPeriodSeconds = parseInt(lockPeriod) * 24 * 60 * 60; // Convert days to seconds

        showToast("⏳ Processing transaction...", "info");

        // Estimate gas first
        const gasEstimate = await savingsVaultContract.methods.addYourSavings(lockPeriodSeconds).estimateGas({
            from: accounts[0],
            value: amountWei
        });

        console.log("Estimated gas:", gasEstimate);

        // Send transaction
        const result = await savingsVaultContract.methods.addYourSavings(lockPeriodSeconds).send({
            from: accounts[0],
            value: amountWei,
            gas: Math.floor(gasEstimate * 1.2) // Add 20% buffer
        });

        console.log("Transaction successful:", result);
        showToast("✅ Funds added successfully! Transaction hash: " + result.transactionHash.slice(0, 10) + "...", "success");

        // Add to transaction history
        addTransaction('deposit', amount, result.transactionHash);

        // Update data after successful transaction
        await updateData();

    } catch (error) {
        console.error("Transaction failed:", error);

        if (error.code === 4001) {
            showToast("❌ Transaction rejected by user", "error");
        } else if (error.message.includes("insufficient funds")) {
            showToast("❌ Insufficient ETH balance for transaction", "error");
        } else if (error.message.includes("gas")) {
            showToast("❌ Gas estimation failed. Please try with a smaller amount", "error");
        } else {
            showToast("❌ Transaction failed: " + error.message, "error");
        }
        throw error;
    }
}

// Withdraw funds from smart contract
async function withdrawFundsFromContract(amount) {
    try {
        const amountWei = web3.utils.toWei(amount, 'ether');

        showToast("⏳ Processing withdrawal...", "info");

        // Estimate gas first
        const gasEstimate = await savingsVaultContract.methods.withdraw(amountWei).estimateGas({
            from: accounts[0]
        });

        console.log("Estimated gas for withdrawal:", gasEstimate);

        // Send transaction
        const result = await savingsVaultContract.methods.withdraw(amountWei).send({
            from: accounts[0],
            gas: Math.floor(gasEstimate * 1.2) // Add 20% buffer
        });

        console.log("Withdrawal successful:", result);
        showToast("✅ Funds withdrawn successfully! Transaction hash: " + result.transactionHash.slice(0, 10) + "...", "success");

        // Add to transaction history
        addTransaction('withdrawal', amount, result.transactionHash);

        // Update data after successful transaction
        await updateData();

    } catch (error) {
        console.error("Withdrawal failed:", error);

        if (error.code === 4001) {
            showToast("❌ Withdrawal rejected by user", "error");
        } else if (error.message.includes("insufficient funds")) {
            showToast("❌ Insufficient savings balance for withdrawal", "error");
        } else if (error.message.includes("lock period")) {
            showToast("❌ Lock period not expired yet", "error");
        } else if (error.message.includes("gas")) {
            showToast("❌ Gas estimation failed. Please try again", "error");
        } else {
            showToast("❌ Withdrawal failed: " + error.message, "error");
        }
        throw error;
    }
}

// Update all data
async function updateData() {
    try {
        if (isDemoMode) {
            updateDemoData();
        } else {
            await updateBlockchainData();
        }
    } catch (error) {
        console.error("❌ Failed to update data:", error);
    }
}

// Update demo data
function updateDemoData() {
    console.log("🔄 Updating demo data...");

    updateDashboard();
    updateLeaderboard();
    updateLotteryInfo();
    updateETHPrice();
    updateHeroData();
    updateRecentTransactions();

    console.log("✅ Demo data updated");
}

// Update blockchain data
async function updateBlockchainData() {
    try {
        console.log("🔄 Updating blockchain data...");

        // Update user balance
        const balance = await web3.eth.getBalance(accounts[0]);
        const balanceEth = web3.utils.fromWei(balance, 'ether');

        const balanceElement = document.getElementById('user-balance');
        if (balanceElement) {
            balanceElement.textContent = parseFloat(balanceEth).toFixed(4);
        }

        // Update user savings
        const userSavings = await savingsVaultContract.methods.getAmountSavedByASaver(accounts[0]).call();
        const userSavingsEth = web3.utils.fromWei(userSavings, 'ether');

        const savingsElement = document.getElementById('total-savings');
        if (savingsElement) {
            savingsElement.textContent = parseFloat(userSavingsEth).toFixed(4);
        }

        // Update progress bar
        const progress = (parseFloat(userSavingsEth) / 50) * 100; // Assuming 50 ETH is max
        const progressElement = document.getElementById('savings-progress');
        if (progressElement) {
            progressElement.textContent = progress.toFixed(1) + '%';
        }

        const progressBar = document.getElementById('progress-bar');
        if (progressBar) {
            progressBar.style.width = Math.min(progress, 100) + '%';
        }

        // Update leaderboard
        await updateLeaderboardFromContract();

        // Update lottery info
        await updateLotteryInfoFromContract();

        // Update ETH price
        await updateETHPrice();

        console.log("✅ Blockchain data updated successfully");

    } catch (error) {
        console.error("❌ Failed to update blockchain data:", error);
        showToast("❌ Failed to update blockchain data", "error");
    }
}

// Update dashboard
async function updateDashboard() {
    try {
        if (isDemoMode) {
            document.getElementById('user-balance').textContent = "0.00";
            document.getElementById('total-savings').textContent = "0.00";
            document.getElementById('savings-progress').textContent = "0%";

            const progressBar = document.getElementById('progress-bar');
            if (progressBar) {
                progressBar.style.width = "0%";
            }
        } else {
            const balance = await web3.eth.getBalance(accounts[0]);
            const balanceEth = web3.utils.fromWei(balance, 'ether');

            const userSavings = await savingsVaultContract.methods.getAmountSavedByASaver(accounts[0]).call();
            const userSavingsEth = web3.utils.fromWei(userSavings, 'ether');

            document.getElementById('user-balance').textContent = parseFloat(balanceEth).toFixed(4);
            document.getElementById('total-savings').textContent = parseFloat(userSavingsEth).toFixed(4);

            const progress = (parseFloat(userSavingsEth) / 50) * 100;
            document.getElementById('savings-progress').textContent = progress.toFixed(1) + '%';

            const progressBar = document.getElementById('progress-bar');
            if (progressBar) {
                progressBar.style.width = Math.min(progress, 100) + '%';
            }
        }

        updateRecentTransactions();

    } catch (error) {
        console.error("❌ Failed to update dashboard:", error);
    }
}

// Update recent transactions
async function updateRecentTransactions() {
    const transactionsContainer = document.getElementById('recent-transactions');
    if (!transactionsContainer) return;

    try {
        if (isDemoMode) {
            // Show demo transactions
            if (recentTransactions.length === 0) {
                transactionsContainer.innerHTML = `
                    <div class="transaction-item">
                        <div class="transaction-icon">💰</div>
                        <div class="transaction-details">
                            <div class="transaction-type">Welcome to VaultWin!</div>
                            <div class="transaction-date">Connect your wallet to start saving</div>
                        </div>
                        <div class="transaction-amount">Demo Mode</div>
                        <div class="transaction-status completed">Demo</div>
                    </div>
                `;
            } else {
                transactionsContainer.innerHTML = recentTransactions.map(tx => `
                    <div class="transaction-item ${tx.type}">
                        <div class="transaction-icon">${tx.type === 'deposit' ? '💰' : '💸'}</div>
                        <div class="transaction-details">
                            <div class="transaction-type">${tx.type === 'deposit' ? 'Deposit' : 'Withdrawal'} #${tx.id}</div>
                            <div class="transaction-date">${tx.date}</div>
                        </div>
                        <div class="transaction-amount">${tx.amount} ETH</div>
                        <div class="transaction-status completed">Completed</div>
                    </div>
                `).join('');
            }
        } else {
            // Show real blockchain transactions
            if (recentTransactions.length === 0) {
                transactionsContainer.innerHTML = `
                    <div class="transaction-item">
                        <div class="transaction-icon">🔗</div>
                        <div class="transaction-details">
                            <div class="transaction-type">Blockchain Mode</div>
                            <div class="transaction-date">Make your first transaction</div>
                        </div>
                        <div class="transaction-amount">Connected</div>
                        <div class="transaction-status completed">Ready</div>
                    </div>
                `;
            } else {
                transactionsContainer.innerHTML = recentTransactions.map(tx => `
                    <div class="transaction-item ${tx.type}">
                        <div class="transaction-icon">${tx.type === 'deposit' ? '💰' : '💸'}</div>
                        <div class="transaction-details">
                            <div class="transaction-type">${tx.type === 'deposit' ? 'Deposit' : 'Withdrawal'} #${tx.id}</div>
                            <div class="transaction-date">${tx.date}</div>
                        </div>
                        <div class="transaction-amount">${tx.amount} ETH</div>
                        <div class="transaction-status completed">${tx.hash ? 'Confirmed' : 'Pending'}</div>
                    </div>
                `).join('');
            }
        }
    } catch (error) {
        console.error("❌ Failed to update recent transactions:", error);
        transactionsContainer.innerHTML = `
            <div class="transaction-item">
                <div class="transaction-icon">⚠️</div>
                <div class="transaction-details">
                    <div class="transaction-type">Error loading transactions</div>
                    <div class="transaction-date">Please try again later</div>
                </div>
                <div class="transaction-amount">Error</div>
                <div class="transaction-status">Failed</div>
            </div>
        `;
    }
}

// Initialize leaderboard
function initializeLeaderboard() {
    // Initialize leaderboard chart if needed
}

// Update leaderboard
async function updateLeaderboard() {
    try {
        if (isDemoMode) {
            updateLeaderboardDemo();
        } else {
            await updateLeaderboardFromContract();
        }
    } catch (error) {
        console.error("❌ Failed to update leaderboard:", error);
    }
}

// Update leaderboard from demo data
function updateLeaderboardDemo() {
    const leaderboardContainer = document.getElementById('leaderboard-list');
    if (!leaderboardContainer) return;

    leaderboardContainer.innerHTML = demoLotteryData.leaderboard.map((entry, index) => `
        <div class="leaderboard-item ${index < 3 ? 'top-' + (index + 1) : ''}">
            <div class="rank">${entry.rank}</div>
            <div class="address">${entry.address.slice(0, 6)}...${entry.address.slice(-4)}</div>
            <div class="amount">${entry.amount.toFixed(3)} ETH</div>
            <div class="progress-bar">
                <div class="progress" style="width: ${demoLotteryData.leaderboard.length > 0 ? (entry.amount / demoLotteryData.leaderboard[0].amount * 100) : 0}%"></div>
            </div>
        </div>
    `).join('');
}

// Update leaderboard from smart contract
async function updateLeaderboardFromContract() {
    try {
        const savers = await savingsVaultContract.methods.getSavers().call();
        const leaderboardData = [];

        for (let i = 0; i < savers.length; i++) {
            const saver = savers[i];
            const amount = await savingsVaultContract.methods.getAmountSavedByASaver(saver).call();
            const amountEth = web3.utils.fromWei(amount, 'ether');

            if (parseFloat(amountEth) > 0) {
                leaderboardData.push({
                    address: saver,
                    amount: parseFloat(amountEth),
                    rank: i + 1
                });
            }
        }

        leaderboardData.sort((a, b) => b.amount - a.amount);

        leaderboardData.forEach((entry, index) => {
            entry.rank = index + 1;
        });

        const leaderboardContainer = document.getElementById('leaderboard-list');
        if (leaderboardContainer) {
            if (leaderboardData.length === 0) {
                leaderboardContainer.innerHTML = `
                    <div class="leaderboard-item">
                        <div class="rank">-</div>
                        <div class="address">No savers yet</div>
                        <div class="amount">Be the first to save!</div>
                    </div>
                `;
            } else {
                leaderboardContainer.innerHTML = leaderboardData.slice(0, 10).map((entry, index) => `
                    <div class="leaderboard-item ${index < 3 ? 'top-' + (index + 1) : ''}">
                        <div class="rank">${entry.rank}</div>
                        <div class="address">${entry.address.slice(0, 6)}...${entry.address.slice(-4)}</div>
                        <div class="amount">${entry.amount.toFixed(4)} ETH</div>
                        <div class="progress-bar">
                            <div class="progress" style="width: ${leaderboardData.length > 0 ? (entry.amount / leaderboardData[0].amount * 100) : 0}%"></div>
                        </div>
                    </div>
                `).join('');
            }
        }

        updatePastWinners();

    } catch (error) {
        console.error("❌ Failed to update leaderboard from contract:", error);
    }
}

// Update past winners (demo data)
function updatePastWinners() {
    const pastWinnersContainer = document.getElementById('past-winners');
    if (!pastWinnersContainer) return;

    pastWinnersContainer.innerHTML = demoLotteryData.pastWinners.map(winner => `
        <div class="winner-item">
            <div class="winner-rank">#${winner.rank}</div>
            <div class="winner-address">${winner.address.slice(0, 6)}...${winner.address.slice(-4)}</div>
            <div class="winner-amount">${winner.amount.toFixed(3)} ETH</div>
            <div class="winner-date">${winner.date}</div>
        </div>
    `).join('');
}

// Update lottery info
async function updateLotteryInfo() {
    try {
        if (isDemoMode) {
            updateLotteryInfoDemo();
        } else {
            await updateLotteryInfoFromContract();
        }
    } catch (error) {
        // Silently handle lottery info errors in demo mode
        if (!isDemoMode) {
            console.error("❌ Failed to update lottery info:", error);
        }
    }
}

// Update lottery info from demo data
function updateLotteryInfoDemo() {
    console.log("🔄 Updating demo lottery info...");

    // Update lottery pool
    const poolElement = document.getElementById('lottery-pool');
    if (poolElement) {
        poolElement.textContent = demoLotteryData.prizePool.toFixed(3) + " ETH";
    }

    // Update players count
    const playersElement = document.getElementById('lottery-players');
    if (playersElement) {
        playersElement.textContent = demoLotteryData.players;
    }

    // Update recent winner
    const winnerElement = document.getElementById('lottery-winner');
    if (winnerElement) {
        winnerElement.textContent = demoLotteryData.recentWinner.slice(0, 6) + '...' + demoLotteryData.recentWinner.slice(-4);
    }

    // Update total savings
    const totalSavingsElement = document.getElementById('totalSavings');
    if (totalSavingsElement) {
        totalSavingsElement.textContent = demoLotteryData.totalSavings.toFixed(3) + " ETH";
    }

    // Update active savers
    const activeSaversElement = document.getElementById('activeSavers');
    if (activeSaversElement) {
        activeSaversElement.textContent = demoLotteryData.activeSavers;
    }

    // Update total savers
    const totalSaversElement = document.getElementById('totalSavers');
    if (totalSaversElement) {
        totalSaversElement.textContent = demoLotteryData.leaderboard.length;
    }

    // Update countdown
    updateLotteryCountdown(demoLotteryData.nextDraw.toISOString());

    console.log("✅ Demo lottery info updated");
}

// Update lottery info from smart contract
async function updateLotteryInfoFromContract() {
    try {
        console.log("🔄 Fetching lottery info from contract...");

        // Get lottery amount
        const lotteryAmount = await lotteryContract.methods.getLotteryAmount().call();
        const lotteryAmountEth = web3.utils.fromWei(lotteryAmount, 'ether');

        const poolElement = document.getElementById('lottery-pool');
        if (poolElement) {
            poolElement.textContent = parseFloat(lotteryAmountEth).toFixed(4) + ' ETH';
        }

        // Get players
        const players = await lotteryContract.methods.getPlayers().call();
        const playersElement = document.getElementById('lottery-players');
        if (playersElement) {
            playersElement.textContent = players.length;
        }

        // Get recent winner
        const recentWinner = await lotteryContract.methods.getRecentWinner().call();
        const winnerElement = document.getElementById('lottery-winner');
        if (winnerElement) {
            if (recentWinner !== '0x0000000000000000000000000000000000000000') {
                winnerElement.textContent = recentWinner.slice(0, 6) + '...' + recentWinner.slice(-4);
            } else {
                winnerElement.textContent = 'No winner yet';
            }
        }

        // Get next draw time
        const lastRun = await lotteryContract.methods.getLastRunTimestamp().call();
        const interval = await lotteryContract.methods.getInterval().call();
        const nextDraw = new Date((parseInt(lastRun) + parseInt(interval)) * 1000);
        updateLotteryCountdown(nextDraw.toISOString());

        // Update total savers
        const savers = await savingsVaultContract.methods.getSavers().call();
        const totalSaversElement = document.getElementById('totalSavers');
        if (totalSaversElement) {
            totalSaversElement.textContent = savers.length;
        }

        // Calculate total savings
        let totalSavings = 0;
        for (let i = 0; i < savers.length; i++) {
            const saverAmount = await savingsVaultContract.methods.getAmountSavedByASaver(savers[i]).call();
            totalSavings += parseFloat(web3.utils.fromWei(saverAmount, 'ether'));
        }

        const totalSavingsElement = document.getElementById('totalSavings');
        if (totalSavingsElement) {
            totalSavingsElement.textContent = totalSavings.toFixed(3) + " ETH";
        }

        const activeSaversElement = document.getElementById('activeSavers');
        if (activeSaversElement) {
            activeSaversElement.textContent = savers.length;
        }

        console.log("✅ Lottery info updated from contract");

    } catch (error) {
        // Silently handle lottery contract errors
        // console.error("❌ Failed to update lottery info from contract:", error);
    }
}

// Update lottery countdown
function updateLotteryCountdown(nextDraw) {
    const countdownElement = document.getElementById('lottery-countdown');
    if (!countdownElement) return;

    const now = new Date();
    const drawTime = new Date(nextDraw);
    const timeLeft = drawTime - now;

    if (timeLeft > 0) {
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

        countdownElement.textContent = `${days}d ${hours}h ${minutes}m`;
    } else {
        countdownElement.textContent = "Drawing...";
    }
}

// Initialize about page
function initializeAbout() {
    // Add any about page specific initialization
}

// Update about page
function updateAbout() {
    const addresses = isDemoMode ?
        { savingsVault: "Demo Mode", lottery: "Demo Mode" } :
        CONTRACT_ADDRESSES[currentNetwork] || { savingsVault: "Not Deployed", lottery: "Not Deployed" };

    document.getElementById('savings-vault-address').textContent = addresses.savingsVault;
    document.getElementById('lottery-address').textContent = addresses.lottery;
}

// Update ETH price
async function updateETHPrice() {
    try {
        if (isDemoMode) {
            const demoPrice = 2450.67;
            const priceElement = document.getElementById('eth-price');
            if (priceElement) {
                priceElement.textContent = `$${demoPrice.toFixed(2)}`;
            }
        } else {
            const priceElement = document.getElementById('eth-price');
            if (priceElement) {
                priceElement.textContent = "$2450.67"; // Placeholder
            }
        }

    } catch (error) {
        console.error("❌ Failed to update ETH price:", error);
    }
}

// Add confetti effect
function addConfettiEffect() {
    const confettiContainer = document.getElementById('confetti-container');
    if (!confettiContainer) return;

    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
        confettiContainer.appendChild(confetti);
    }
}

// Show toast message
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Toggle mobile menu
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('hidden');
    }
}

// Update hero section with demo data
function updateHeroData() {
    const heroPrizePool = document.getElementById('heroPrizePool');
    const heroNextLottery = document.getElementById('heroNextLottery');

    if (heroPrizePool) {
        heroPrizePool.textContent = demoLotteryData.prizePool.toFixed(3) + " ETH";
    }

    if (heroNextLottery) {
        const now = new Date();
        const timeLeft = demoLotteryData.nextDraw - now;
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        heroNextLottery.textContent = `${days}d ${hours}h`;
    }
}

// Add transaction to history
function addTransaction(type, amount, hash = null) {
    transactionCounter++;
    const transaction = {
        id: transactionCounter,
        type: type,
        amount: parseFloat(amount).toFixed(4),
        date: new Date().toLocaleString(),
        hash: hash
    };

    recentTransactions.unshift(transaction); // Add to beginning

    // Keep only last 10 transactions
    if (recentTransactions.length > 10) {
        recentTransactions = recentTransactions.slice(0, 10);
    }

    // Update the display
    updateRecentTransactions();
}

// Clear transaction history
function clearTransactionHistory() {
    recentTransactions = [];
    transactionCounter = 0;
    updateRecentTransactions();
}

// Initialize lottery stats page
function initializeLotteryStats() {
    // This will be called when the lottery stats page is loaded
    updateLotteryStatsPage();
}

// Update lottery stats page
function updateLotteryStatsPage() {
    console.log("🔄 Updating lottery stats page...");

    // Update main stats
    const poolElement = document.getElementById('lottery-stats-pool');
    if (poolElement) {
        poolElement.textContent = demoLotteryData.prizePool.toFixed(3) + " ETH";
    }

    const playersElement = document.getElementById('lottery-stats-players');
    if (playersElement) {
        playersElement.textContent = demoLotteryData.players;
    }

    const savingsElement = document.getElementById('lottery-stats-savings');
    if (savingsElement) {
        savingsElement.textContent = demoLotteryData.totalSavings.toFixed(3) + " ETH";
    }

    // Update countdown
    const countdownElement = document.getElementById('lottery-stats-countdown');
    if (countdownElement) {
        const now = new Date();
        const timeLeft = demoLotteryData.nextDraw - now;
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        countdownElement.textContent = `${days}d ${hours}h`;
    }

    // Update latest winner
    const winnerElement = document.getElementById('lottery-stats-winner');
    if (winnerElement) {
        winnerElement.textContent = demoLotteryData.recentWinner.slice(0, 6) + '...' + demoLotteryData.recentWinner.slice(-4);
    }

    const winnerDateElement = document.getElementById('lottery-stats-winner-date');
    if (winnerDateElement) {
        winnerDateElement.textContent = demoLotteryData.pastWinners[0].date;
    }

    // Update past winners
    const pastWinnersElement = document.getElementById('lottery-stats-past-winners');
    if (pastWinnersElement) {
        pastWinnersElement.innerHTML = demoLotteryData.pastWinners.map(winner => `
            <div class="winner-item">
                <div class="winner-rank">#${winner.rank}</div>
                <div class="winner-address">${winner.address.slice(0, 6)}...${winner.address.slice(-4)}</div>
                <div class="winner-amount">${winner.amount.toFixed(3)} ETH</div>
                <div class="winner-date">${winner.date}</div>
            </div>
        `).join('');
    }

    console.log("✅ Lottery stats page updated");
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
