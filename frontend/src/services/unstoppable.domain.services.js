import { Resolution } from "@unstoppabledomains/resolution";

const resolution = new Resolution();

export const resolveDomainService = async ({ domain, ticker }) => {
  try {
    const address = await resolution.addr(domain, ticker);

    return address;
  } catch (error) {
    console.error("Error resolving domain:", error);
    return null;
  }
};
