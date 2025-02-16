// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IEndpointV2Mock {
    function setDestLzEndpoint(address _contract, address _endpoint) external;

    function setDelegate(address _delegate) external;

    function setDefaultFee(uint256 _fee) external;

    function lzReceive(
        address _contract,
        uint16 _srcEid,
        bytes calldata _payload,
        address _from,
        bytes calldata _extraData
    ) external;

    function send(
        uint16 /* _dstEid */,
        bytes calldata,
        bytes calldata,
        address payable,
        address,
        bytes calldata
    ) external payable;

    function quote(
        uint16,
        MessagingParams memory,
        bytes memory
    ) external view returns (MessagingFee memory);

    struct MessagingParams {
        address dstAddress;
        bytes payload;
    }

    struct MessagingFee {
        uint256 nativeFee;
        uint256 lzTokenFee;
    }
}
