import { Resolution } from "@unstoppabledomains/resolution";

const resolution = new Resolution();

export const resolveDomainService = async ({ domain, tickers }) => {
  try {
    if (!Array.isArray(tickers) || tickers.length === 0) {
      throw new Error("Tickers must be a non-empty array");
    }

    const results = await Promise.allSettled(
      tickers.map(async (ticker) => {
        try {
          const address = await resolution.addr(domain, ticker);
          return { success: true, ticker, address };
        } catch {
          return { success: false, ticker };
        }
      })
    );

    const successfulResolutions = results
      .filter((res) => res.status === "fulfilled" && res.value.success)
      .map((res) => res.value);

    if (successfulResolutions.length > 0) {
      return successfulResolutions[0]; // Return the first successful resolution
    } else {
      throw new Error("All ticker resolutions failed");
    }
  } catch (error) {
    console.error("Error resolving domain:", error);
    return { success: false, error: error.message };
  }
};
