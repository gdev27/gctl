// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Minimal 0G-compatible anchor contract for execution artifact attestations.
contract ExecutionAnchor {
    event AttestationAnchored(
        bytes32 indexed attestationId,
        string policyId,
        string executionRef,
        bytes32 artifactHash,
        address indexed writer
    );

    mapping(bytes32 => bool) public anchored;

    function anchorAttestation(
        bytes32 attestationId,
        string calldata policyId,
        string calldata executionRef,
        bytes32 artifactHash
    ) external returns (bytes32) {
        require(!anchored[attestationId], "attestation_exists");
        anchored[attestationId] = true;
        emit AttestationAnchored(attestationId, policyId, executionRef, artifactHash, msg.sender);
        return attestationId;
    }
}
