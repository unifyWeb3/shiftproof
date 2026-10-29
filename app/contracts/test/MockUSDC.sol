// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @notice Test-only 6-decimal ERC-20 mock used by ShiftProof unit tests.
///         Never deployed to mainnet or testnet.
contract MockUSDC is ERC20 {
    uint8 private _dec;

    constructor(uint8 decimals_) ERC20("Mock USDC", "mUSDC") {
        _dec = decimals_;
    }

    function decimals() public view override returns (uint8) {
        return _dec;
    }

    /// @notice Mint tokens to any address (test helper only).
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

/// @notice Reentrant mock that attempts to call back into ShiftProof during a transfer.
///         Used to verify nonReentrant guards.
contract ReentrantMockToken {
    uint8 private constant DEC = 6;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    address public target;      // ShiftProof contract
    bytes   public reentrantCall; // encoded calldata to replay

    string  public constant name     = "Reentrant Token";
    string  public constant symbol   = "REENT";
    uint256 public constant totalSupply = type(uint256).max;

    constructor() {
        balanceOf[msg.sender] = type(uint256).max;
    }

    function decimals() external pure returns (uint8) { return DEC; }

    function setReentrantCall(address target_, bytes calldata data) external {
        target = target_;
        reentrantCall = data;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        _doTransfer(msg.sender, to, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        if (allowance[from][msg.sender] != type(uint256).max) {
            allowance[from][msg.sender] -= amount;
        }
        _doTransfer(from, to, amount);
        return true;
    }

    function _doTransfer(address from, address to, uint256 amount) internal {
        balanceOf[from] -= amount;
        balanceOf[to]   += amount;
        // Attempt the reentrant call if configured; propagate any revert so the
        // outer guarded call also fails, making the test assertion clean.
        if (target != address(0) && reentrantCall.length > 0) {
            (bool ok, bytes memory reason) = target.call(reentrantCall);
            if (!ok) {
                // bubble up the revert from the inner call
                assembly {
                    revert(add(reason, 32), mload(reason))
                }
            }
        }
    }
}
