import { ethers } from "hardhat"
import { LayerZeroChainInfo } from "../utils/lzendpoints.help"

export const setLayerZeroLibs = async (
    baseContract: {
        layerzeroInfo: LayerZeroChainInfo
        oappAddress: string
        sendLibAddress: string
        receiveLibAddress: string
        dvnAddress: string
    },
    crossContract: {
        layerzeroInfo: LayerZeroChainInfo
        oappAddress: string
        sendLibAddress: string
        receiveLibAddress: string
        dvnAddress: string
    }
) => {
    try {
        const endpointAbi = [
            "function setSendLibrary(address oapp, uint32 eid, address sendLib) external",
            "function setReceiveLibrary(address oapp, uint32 eid, address receiveLib,uint256 _graceperiod) external",
            "function setConfig(address _oapp, address _lib, SetConfigParam[] calldata _params) external",
        ]

        // struct SetConfigParam {
        //     uint32 eid;
        //     uint32 configType;
        //     bytes config;
        //   }

        const endpointContract = new ethers.Contract(
            baseContract.layerzeroInfo.endpointV2!,
            endpointAbi
        )

        const sendTx = await endpointContract.setSendLibrary(
            baseContract.oappAddress,
            crossContract.layerzeroInfo.endpointIdV2,
            baseContract.sendLibAddress
        )
        await sendTx.wait(1)

        const receiveTx = await endpointContract.setReceiveLibrary(
            baseContract.oappAddress,
            crossContract.layerzeroInfo.endpointIdV2,
            baseContract.receiveLibAddress,
            0
        )

        await receiveTx.wait(1)

        const ulnConfig = {
            confirmations: 1,
            requiredDVNCount: 1,
            optionalDVNCount: 0,
            optionalDVNThreshold: 0,
            requiredDVNs: [baseContract.dvnAddress],
            optionalDVNs: [],
        }

        const executorConfig = {
            maxMessageSize: 10000,
            executorAddress: "0xExecutorAddress",
        }

        const configTypeUlnStruct =
            "tuple(uint64 confirmations, uint8 requiredDVNCount, uint8 optionalDVNCount, uint8 optionalDVNThreshold, address[] requiredDVNs, address[] optionalDVNs)"
        const encodedUlnConfig = ethers.AbiCoder.defaultAbiCoder().encode(
            [configTypeUlnStruct],
            [ulnConfig]
        )

        const configTypeExecutorStruct = "tuple(uint32 maxMessageSize, address executorAddress)"
        const encodedExecutorConfig = ethers.AbiCoder.defaultAbiCoder().encode(
            [configTypeExecutorStruct],
            [executorConfig]
        )

        const setConfigParamUln = {
            eid: crossContract.layerzeroInfo.endpointIdV2,
            configType: 2,
            config: encodedUlnConfig,
        }

        const setConfigParamExecutor = {
            eid: crossContract.layerzeroInfo.endpointIdV2,
            configType: 1,
            config: encodedExecutorConfig,
        }

        const configSendTx = await endpointContract.setConfig(
            baseContract.oappAddress,
            baseContract.sendLibAddress,
            [setConfigParamUln, setConfigParamExecutor]
        )

        await configSendTx.wait(1)

        const configReceiveTx = await endpointContract.setConfig(
            baseContract.oappAddress,
            baseContract.receiveLibAddress,
            [setConfigParamUln, setConfigParamExecutor]
        )

        await configReceiveTx.wait(1)

        console.log("✅ LayerZero libraries set")
    } catch (error) {
        console.log(`❌ Error setting LayerZero libraries: ${error}`)
        process.exit(1)
    }
}
