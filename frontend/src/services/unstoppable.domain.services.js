import { Resolution } from "@unstoppabledomains/resolution";

const resolution = new Resolution();

export const resolveDomainService = async ({ domain, tickers }) => {
  try {
    if (Array.isArray(tickers) === false) {
      throw new Error("Tickers must be an array");
    }
    if (tickers.length === 0) {
      throw new Error("Tickers array must not be empty");
    }
    const promises = tickers.map((ticker) =>
      resolution
        .addr(domain, ticker)
        .then((address) => ({ success: true, ticker, address }))
        .catch(() => ({ success: false, ticker }))
    );

    const result = await Promise.race(promises);

    if (result.success) {
      return result;
    } else {
      throw new Error("All ticker resolutions failed");
    }
  } catch (error) {
    console.error("Error resolving domain:", error);
    return { success: false, error: error.message };
  }
};
