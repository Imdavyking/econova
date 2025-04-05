// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AuditRegistry {
    struct Audit {
        uint8 stars;
        string summary;
        address auditor;
        uint256 timestamp;
    }

    mapping(bytes32 => Audit[]) private audits;
    mapping(address => bytes32[]) private auditorHistory;
    bytes32[] private allContracts;

    event AuditRegistered(
        bytes32 indexed contractHash,
        uint8 stars,
        string summary,
        address indexed auditor,
        uint256 timestamp
    );

    // Function to register an audit for a contract
    function registerAudit(bytes32 contractHash, uint8 stars, string calldata summary) external {
        Audit memory newAudit = Audit({
            stars: stars,
            summary: summary,
            auditor: msg.sender,
            timestamp: block.timestamp
        });

        audits[contractHash].push(newAudit);
        auditorHistory[msg.sender].push(contractHash);

        emit AuditRegistered(contractHash, stars, summary, msg.sender, block.timestamp);

        if (audits[contractHash].length == 1) {
            allContracts.push(contractHash);
        }
    }

    // Function to get all audits of a specific contract
    function getContractAudits(bytes32 contractHash) external view returns (Audit[] memory) {
        return audits[contractHash];
    }

    // Function to get the history of audits performed by an auditor
    function getAuditorHistory(address auditor) external view returns (bytes32[] memory) {
        return auditorHistory[auditor];
    }

    // Function to get the latest audit of a contract
    function getLatestAudit(bytes32 contractHash) external view returns (Audit memory) {
        uint256 length = audits[contractHash].length;
        require(length > 0, "No audits found for this contract");
        return audits[contractHash][length - 1];
    }

    // Function to get all audits with pagination
    function getAllAudits(
        uint256 startIndex,
        uint256 limit
    )
        external
        view
        returns (
            bytes32[] memory contractHashes,
            uint8[] memory stars,
            string[] memory summaries,
            address[] memory auditors,
            uint256[] memory timestamps
        )
    {
        uint256 total = allContracts.length;
        uint256 endIndex = startIndex + limit > total ? total : startIndex + limit;

        contractHashes = new bytes32[](endIndex - startIndex);
        stars = new uint8[](endIndex - startIndex);
        summaries = new string[](endIndex - startIndex);
        auditors = new address[](endIndex - startIndex);
        timestamps = new uint256[](endIndex - startIndex);

        for (uint256 i = startIndex; i < endIndex; i++) {
            bytes32 contractHash = allContracts[i];
            Audit memory audit = audits[contractHash][audits[contractHash].length - 1];
            contractHashes[i - startIndex] = contractHash;
            stars[i - startIndex] = audit.stars;
            summaries[i - startIndex] = audit.summary;
            auditors[i - startIndex] = audit.auditor;
            timestamps[i - startIndex] = audit.timestamp;
        }
    }

    // Function to get the total number of contracts
    function getTotalContracts() external view returns (uint256) {
        return allContracts.length;
    }
}
