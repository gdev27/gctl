// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

contract PolicyRegistry is AccessControl, Pausable {
    bytes32 public constant POLICY_ADMIN_ROLE = keccak256("POLICY_ADMIN_ROLE");
    bytes32 public constant GUARDIAN_ROLE = keccak256("GUARDIAN_ROLE");

    struct PolicyMeta {
        bytes32 hash;
        string uri;
        bool active;
        uint256 updatedAt;
    }

    mapping(bytes32 => PolicyMeta) public policies;

    event PolicyRegistered(bytes32 indexed policyId, bytes32 indexed hash, string uri, address indexed actor);
    event PolicyActivationSet(bytes32 indexed policyId, bool active, address indexed actor);
    event RegistryPaused(address indexed actor);
    event RegistryUnpaused(address indexed actor);

    constructor(address admin, address policyAdmin, address guardian) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(POLICY_ADMIN_ROLE, policyAdmin);
        _grantRole(GUARDIAN_ROLE, guardian);
    }

    function registerPolicy(bytes32 policyId, bytes32 hash, string calldata uri) external whenNotPaused onlyRole(POLICY_ADMIN_ROLE) {
        policies[policyId] = PolicyMeta({hash: hash, uri: uri, active: true, updatedAt: block.timestamp});
        emit PolicyRegistered(policyId, hash, uri, msg.sender);
    }

    function setActive(bytes32 policyId, bool active) external whenNotPaused onlyRole(POLICY_ADMIN_ROLE) {
        PolicyMeta storage meta = policies[policyId];
        require(meta.hash != bytes32(0), "policy_not_found");
        meta.active = active;
        meta.updatedAt = block.timestamp;
        emit PolicyActivationSet(policyId, active, msg.sender);
    }

    function pause() external onlyRole(GUARDIAN_ROLE) {
        _pause();
        emit RegistryPaused(msg.sender);
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
        emit RegistryUnpaused(msg.sender);
    }
}
