import { PinataSDK } from "pinata";
import { environment } from "../utils/config";

const pinata = new PinataSDK({
  pinataJwt: environment.PINATA_JWT!,
  pinataGateway: "https://emerald-odd-bee-965.mypinata.cloud",
});

export const uploadToPinata = async (file: File) => {
  try {
    const { cid } = await pinata.upload.public.file(file);
    const url = await pinata.gateways.public.convert(cid);
    return url;
  } catch (_) {
    return null;
  }
};
