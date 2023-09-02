// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

interface BankInterface {
    /// @notice deposit funds in to your bank account.
    function deposit() external payable;

    /// @notice withdraw funds from your bank account.
    function withdraw() external;

    /// @notice get your bank balance.
    function getBankBalance() external view returns (uint256);

    /// @notice get the balance of the bank contract.
    function getContractBalance() external view returns (uint256);
}
