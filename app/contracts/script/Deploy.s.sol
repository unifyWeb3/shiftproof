// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {ShiftProof} from "../ShiftProof.sol";

/// @title ShiftProof V1 deploy script
/// @notice Must be run on Arc Testnet (5042002) or Arc Mainnet (5042).
///         Asserts chain ID and USDC address before deploying.
///         This script compiles but does NOT broadcast; add `--broadcast` to deploy.
contract Deploy is Script {
    /// @dev Arc USDC address (same on testnet and mainnet).
    address internal constant USDC_ARC = 0x3600000000000000000000000000000000000000;

    function run() external {
        // --- Pre-flight assertions ---
        uint256 cid = block.chainid;
        require(
            cid == 5042 || cid == 5042002,
            "Deploy: wrong chain - must be Arc Mainnet (5042) or Arc Testnet (5042002)"
        );
        require(
            USDC_ARC != address(0),
            "Deploy: USDC address is zero"
        );
        require(
            IERC20Metadata(USDC_ARC).decimals() == 6,
            "Deploy: USDC decimals must be 6"
        );

        // --- Deploy ---
        vm.startBroadcast();
        ShiftProof sp = new ShiftProof(USDC_ARC);
        vm.stopBroadcast();

        console.log("ShiftProof deployed at:", address(sp));
        console.log("  usdc        :", sp.usdc());
        console.log("  nextShiftId :", sp.nextShiftId());
        console.log("  chain       :", cid);
    }
}
