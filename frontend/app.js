// --- Contract Addresses and ABIs (replace with your actual values) ---
const SAVINGS_VAULT_ADDRESS = "YOUR_SAVINGS_VAULT_ADDRESS";
const LOTTERY_ADDRESS = "YOUR_LOTTERY_ADDRESS";
const SAVINGS_VAULT_ABI = [ /* ...SavingsVault ABI... */];
const LOTTERY_ABI = [ /* ...Lottery ABI... */];

let provider, signer, userAddress;
let savingsVaultContract, lotteryContract;

// --- MetaMask Connect ---
const connectBtn = document.getElementById('connectBtn');
connectBtn.onclick = async () => {
    if (window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send('eth_requestAccounts', []);
        signer = provider.getSigner();
        userAddress = await signer.getAddress();
        connectBtn.textContent = userAddress.slice(0, 6) + '...' + userAddress.slice(-4);
        connectBtn.classList.add('bg-green-500');
        // Initialize contracts
        savingsVaultContract = new ethers.Contract(SAVINGS_VAULT_ADDRESS, SAVINGS_VAULT_ABI, signer);
        lotteryContract = new ethers.Contract(LOTTERY_ADDRESS, LOTTERY_ABI, signer);
        updateUserData();
    } else {
        alert('MetaMask not detected!');
    }
};

// --- SavingsVault Interactions ---
async function deposit(amount, lockDays) {
    if (!savingsVaultContract) return alert("Connect MetaMask first!");
    try {
        // Uncomment and update with your contract's deposit logic
        // const tx = await savingsVaultContract.deposit(
        //   ethers.utils.parseEther(amount),
        //   lockDays,
        //   { value: ethers.utils.parseEther(amount) }
        // );
        // await tx.wait();
        alert(`Deposit ${amount} ETH for ${lockDays} days (placeholder)`);
        updateUserData();
    } catch (err) {
        alert("Deposit failed: " + (err.reason || err.message));
    }
}

async function withdraw() {
    if (!savingsVaultContract) return alert("Connect MetaMask first!");
    try {
        // Uncomment and update with your contract's withdraw logic
        // const tx = await savingsVaultContract.withdraw();
        // await tx.wait();
        alert('Withdraw funds (placeholder)');
        updateUserData();
    } catch (err) {
        alert("Withdraw failed: " + (err.reason || err.message));
    }
}

// --- UI Hooks ---
const depositBtn = document.getElementById('depositBtn');
const withdrawBtn = document.getElementById('withdrawBtn');
depositBtn.onclick = () => {
    const amount = document.getElementById('depositAmount').value;
    const lockDays = document.getElementById('lockPeriod').value;
    deposit(amount, lockDays);
};
withdrawBtn.onclick = () => withdraw();

// --- Dummy Data for Leaderboard and Chart ---
let leaderboardData = [
    { address: '0xA1...1234', saved: 12.5 },
    { address: '0xB2...5678', saved: 8.3 },
    { address: '0xC3...9abc', saved: 5.7 },
    { address: '0xD4...def0', saved: 3.2 },
    { address: '0xE5...4567', saved: 2.1 },
];

function updateLeaderboard() {
    const leaderboard = document.getElementById('leaderboard');
    leaderboard.innerHTML = '';
    leaderboardData.forEach((user) => {
        leaderboard.innerHTML += `<li><span class='font-bold text-blue-400'>${user.address}</span> — <span class='text-purple-300'>${user.saved} ETH</span></li>`;
    });
}

function renderChart() {
    const ctx = document.getElementById('savingsChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: leaderboardData.map(u => u.address),
            datasets: [{
                data: leaderboardData.map(u => u.saved),
                backgroundColor: [
                    '#a084ee', '#5b8df6', '#393053', '#232946', '#18122B'
                ],
                borderWidth: 2,
            }],
        },
        options: {
            plugins: {
                legend: {
                    labels: { color: '#fff', font: { size: 14 } }
                }
            }
        }
    });
}

// --- Fetch and Update User Data ---
async function updateUserData() {
    if (!savingsVaultContract || !lotteryContract || !userAddress) {
        // Use dummy data if not connected
        document.getElementById('currentSavings').textContent = '1.23';
        document.getElementById('lockTimeLeft').textContent = '6d 12h 30m';
        document.getElementById('latestWinner').textContent = '0xA1...1234';
        document.getElementById('winnerTimestamp').textContent = '2024-06-01 12:34';
        return;
    }
    try {
        // Uncomment and update with your contract's read logic
        // const savings = await savingsVaultContract.getUserSavings(userAddress);
        // const lockEnd = await savingsVaultContract.getUserLockEnd(userAddress);
        // document.getElementById('currentSavings').textContent = ethers.utils.formatEther(savings);
        // const now = Math.floor(Date.now() / 1000);
        // const secondsLeft = lockEnd - now;
        // document.getElementById('lockTimeLeft').textContent = secondsLeft > 0 ? formatTime(secondsLeft) : "Unlocked";
        // const winner = await lotteryContract.latestWinner();
        // const timestamp = await lotteryContract.latestTimestamp();
        // document.getElementById('latestWinner').textContent = winner;
        // document.getElementById('winnerTimestamp').textContent = new Date(timestamp * 1000).toLocaleString();
    } catch (err) {
        console.error(err);
    }
}

function formatTime(seconds) {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${d}d ${h}h ${m}m`;
}

// --- On Load ---
window.onload = () => {
    updateLeaderboard();
    renderChart();
    updateUserData();
};
