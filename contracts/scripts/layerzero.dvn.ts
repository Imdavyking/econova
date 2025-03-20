import { ExecutorOptionType } from "@layerzerolabs/lz-v2-utilities"
import { OAppEnforcedOption, OmniPointHardhat } from "@layerzerolabs/toolbox-hardhat"
import { generateConnectionsConfig } from "@layerzerolabs/metadata-tools"
import { EndpointId } from "@layerzerolabs/lz-definitions"
export const setLayerZeroDVN = async () =>
    // baseContract: OmniPointHardhat,
    // crossContract: OmniPointHardhat
    {
        const baseContract: OmniPointHardhat = {
            eid: EndpointId.SONIC_V2_MAINNET,
            contractName: "EcoNovaToken",
            address: "0x4774fdcb1e23cb6a2efac10a8e4bca0600518dbd",
        }

        const crossContract: OmniPointHardhat = {
            eid: EndpointId.POLYGON_V2_MAINNET,
            contractName: "EcoNovaToken",
            address: "0x1042a42FB30567d32eeE7d98E76d91b424ef2b85",
        }
        const EVM_ENFORCED_OPTIONS: OAppEnforcedOption[] = [
            {
                msgType: 1,
                optionType: ExecutorOptionType.LZ_RECEIVE,
                gas: 80000,
                value: 0,
            },
            {
                msgType: 2,
                optionType: ExecutorOptionType.LZ_RECEIVE,
                gas: 80000,
                value: 0,
            },
            {
                msgType: 2,
                optionType: ExecutorOptionType.COMPOSE,
                index: 0,
                gas: 80000,
                value: 0,
            },
        ]

        const connections = await generateConnectionsConfig([
            [
                baseContract, // Chain A contract
                crossContract, // Chain B contract
                [["LayerZero Labs"], []], // [ requiredDVN[], [ optionalDVN[], threshold ] ]
                [1, 1], // [A to B confirmations, B to A confirmations]
                [EVM_ENFORCED_OPTIONS, EVM_ENFORCED_OPTIONS], // Chain B enforcedOptions, Chain A enforcedOptions
            ],
        ])

        return {
            contracts: [{ contract: baseContract }, { contract: crossContract }],
            connections,
        }
    }
