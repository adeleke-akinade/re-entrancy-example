// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

import {BankInterface} from "./BankInterface.sol";

contract VulnerableBank is BankInterface {
    mapping(address => uint256) private balances;

    /// @inheritdoc BankInterface
    function deposit() external payable {
        require(msg.value >= 1 ether, "Bank: minimum deposit is 1 ether");
        balances[msg.sender] += msg.value;
    }

    /// @inheritdoc BankInterface
    /// @dev this is vulnerable to a re-entrancy exploit because the callers balance is updated after control is passed to them.
    function withdraw() external {
        uint256 _balance = balances[msg.sender];
        require(_balance >= 1 ether, "Bank: insufficient funds");
        (bool sent, ) = payable(msg.sender).call{value: _balance}("");
        require(sent, "Bank: failed to send funds");
        balances[msg.sender] = 0; // This should be set to zero before sending the funds to the caller.
    }

    /// @inheritdoc BankInterface
    function getBankBalance() external view returns (uint256) {
        return balances[msg.sender];
    }

    /// @inheritdoc BankInterface
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
