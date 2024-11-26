import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";
import confetti from "canvas-confetti"; // Import confetti library

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [deposits, setDeposits] = useState([]); // State for deposits
  const [withdrawals, setWithdrawals] = useState([]); // State for withdrawals
  const [loading, setLoading] = useState(false); // Loading state for transactions

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    // Once wallet is set, get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      const balanceInWei = await atm.getBalance(); // Get balance as BigNumber
      const balanceInEth = ethers.utils.formatEther(balanceInWei); // Convert to Ether
      setBalance(balanceInEth); // Store as string
    }
  };

  const fetchRecords = async () => {
    if (atm) {
      setLoading(true);
      await getDeposits(); // Fetch deposit records
      await getWithdrawals(); // Fetch withdrawal records
      setLoading(false);
    }
  };

  const getDeposits = async () => {
    if (atm) {
      const depositRecords = await atm.getDeposits();
      const formattedDeposits = depositRecords.map(record => ({
        amount: ethers.utils.formatEther(record.amount),
        timestamp: record.timestamp,
      }));
      setDeposits(formattedDeposits);
    }
  };

  const getWithdrawals = async () => {
    if (atm) {
      const withdrawalRecords = await atm.getWithdrawals();
      const formattedWithdrawals = withdrawalRecords.map(record => ({
        amount: ethers.utils.formatEther(record.amount),
        timestamp: record.timestamp,
      }));
      setWithdrawals(formattedWithdrawals);
    }
  };

  const deposit = async () => {
    if (atm && !loading) {
      setLoading(true);
      try {
        const depositAmount = ethers.utils.parseEther("1");  // Convert 1 ETH to wei
        let tx = await atm.deposit(depositAmount);
        await tx.wait();
        getBalance();
        fetchRecords(); // Update records after deposit
        triggerConfetti(); // Trigger confetti after deposit
      } catch (error) {
        console.error("Error during deposit:", error);
        alert("Transaction failed");
      }
      setLoading(false);
    }
  };

  const withdraw = async () => {
    if (atm && !loading) {
      setLoading(true);
      try {
        const withdrawAmount = ethers.utils.parseEther("1");  // Convert 1 ETH to wei
        let tx = await atm.withdraw(withdrawAmount);
        await tx.wait();
        getBalance();
        fetchRecords(); // Update records after withdrawal
        triggerConfetti(); // Trigger confetti after withdrawal
      } catch (error) {
        console.error("Error during withdrawal:", error);
        alert("Transaction failed");
      }
      setLoading(false);
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100, // Number of confetti pieces
      spread: 70,         // Spread angle of the confetti
      origin: { y: 0.6 }, // Position of the confetti (60% from the top)
    });
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    if (!account) {
      return (
        <button onClick={connectAccount}>Please connect your Metamask wallet</button>
      );
    }

    if (balance == undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance} ETH</p>
        <button onClick={deposit} disabled={loading}>Deposit 1 ETH</button>
        <button onClick={withdraw} disabled={loading}>Withdraw 1 ETH</button>

        {/* Displaying deposit records */}
        <div>
          <h3>Deposit History</h3>
          {deposits.length > 0 ? (
            <ul>
              {deposits.map((deposit, index) => (
                <li key={index}>
                  Amount: {deposit.amount} ETH at{" "}
                  {new Date(deposit.timestamp * 1000).toLocaleString()}
                </li>
              ))}
            </ul>
          ) : (
            <p>No deposits yet.</p>
          )}
        </div>

        {/* Displaying withdrawal records */}
        <div>
          <h3>Withdrawal History</h3>
          {withdrawals.length > 0 ? (
            <ul>
              {withdrawals.map((withdrawal, index) => (
                <li key={index}>
                  Amount: {withdrawal.amount} ETH at{" "}
                  {new Date(withdrawal.timestamp * 1000).toLocaleString()}
                </li>
              ))}
            </ul>
          ) : (
            <p>No withdrawals yet.</p>
          )}
        </div>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  useEffect(() => {
    if (atm) fetchRecords(); // Automatically fetch records when contract is initialized
  }, [atm]);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Beep's ATM!</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
          background-color: pink; /* Pink background */
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
      `}</style>
    </main>
  );
}
