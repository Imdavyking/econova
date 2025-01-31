// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

library EthSign {
    /**
     * @dev Hash the message to create an Ethereum-signed message hash
     * @param messageHash The original message hash
     * @return The Ethereum-signed message hash
     */
    function getEthSignedMessageHash(bytes32 messageHash) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
    }

    /**
     * @dev Recover the signer of the message
     * @param ethSignedMessageHash The Ethereum-signed message hash
     * @param signature The signature to verify
     * @return The recovered address
     */
    function recoverSigner(
        bytes32 ethSignedMessageHash,
        bytes memory signature
    ) internal pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(signature);
        return ecrecover(ethSignedMessageHash, v, r, s);
    }

    /**
     * @dev Split the signature into r, s, and v
     * @param signature The full signature
     * @return r The r component of the signature
     * @return s The s component of the signature
     * @return v The v component of the signature
     */
    function splitSignature(
        bytes memory signature
    ) internal pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(signature.length == 65, "Invalid signature length");

        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }
    }
}
