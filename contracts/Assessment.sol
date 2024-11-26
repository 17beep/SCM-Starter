// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

//import "hardhat/console.sol";

contract Assessment {
    address payable public owner;
    uint256 public balance;

    // Define structures for transaction records
    struct Transaction { 
        uint256 amount;
        uint256 timestamp;
    }

    // Arrays to store deposit and withdrawal records
    Transaction[] public deposits; 
    Transaction[] public withdrawals;  

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    function getBalance() public view returns(uint256) {
        return balance;
    }

    // Deposit function with transaction record
    function deposit(uint256 _amount) public payable {
        uint _previousBalance = balance;

        // make sure this is the owner
        require(msg.sender == owner, "You are not the owner of this account");

        // perform transaction
        balance += _amount;

        // Record the deposit (new functionality)
        deposits.push(Transaction(_amount, block.timestamp));  

        // assert transaction completed successfully
        assert(balance == _previousBalance + _amount);

        // emit the event
        emit Deposit(_amount);
    }

    // Custom error for insufficient balance during withdrawal
    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    // Withdraw function with transaction record
    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        uint _previousBalance = balance;
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }

        // withdraw the given amount
        balance -= _withdrawAmount;

        // Record the withdrawal (new functionality)
        withdrawals.push(Transaction(_withdrawAmount, block.timestamp));

        // assert the balance is correct
        assert(balance == (_previousBalance - _withdrawAmount));

        // emit the event
        emit Withdraw(_withdrawAmount);
    }

    // Function to get all deposit records (new function)
    function getDeposits() public view returns (Transaction[] memory) {  
        return deposits;
    }

    // Function to get all withdrawal records (new function)
    function getWithdrawals() public view returns (Transaction[] memory) { 
        return withdrawals;
    }
}
