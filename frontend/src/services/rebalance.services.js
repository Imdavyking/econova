class RebalancePortfolio {
  constructor(targetAllocations, buffer) {
    this.TARGET_ALLOCATIONS = targetAllocations;
    this.BUFFER = buffer;
    this.SIX_DECIMALS = 1_000_000;
    this.EIGHTEEN_DECIMALS = 1_000_000_000_000_000_000;
  }

  calculateRebalancingTrades(usdcData, wethData) {
    let usdcValue = usdcData.balance * usdcData.price;
    let wethValue = wethData.balance * wethData.price;
    let totalValue = usdcValue + wethValue;

    let targetUsdcValue = totalValue * this.TARGET_ALLOCATIONS.usdc;
    let targetWethValue = totalValue * this.TARGET_ALLOCATIONS.weth;

    let usdcTradeUsd = targetUsdcValue - usdcValue;
    let wethTradeUsd = targetWethValue - wethValue;

    return {
      usdc: { trade: usdcTradeUsd / usdcData.price },
      weth: { trade: wethTradeUsd / wethData.price },
    };
  }

  getPrice(feedName) {
    // Mock function, replace with actual price fetching logic
    let mockPrices = { usdc_usd_price_feed: 1.0, eth_usd_price_feed: 3000.0 };
    return mockPrices[feedName] || 0;
  }

  rebalance(usdcBalance, wethBalance) {
    let usdcValue =
      (usdcBalance / this.SIX_DECIMALS) * this.getPrice("usdc_usd_price_feed");
    let wethValue =
      (wethBalance / this.EIGHTEEN_DECIMALS) *
      this.getPrice("eth_usd_price_feed");

    let totalValue = usdcValue + wethValue;
    let usdcPercentAllocation = usdcValue / totalValue;
    let wethPercentAllocation = wethValue / totalValue;

    console.log(
      `Current USDC Allocation: ${(usdcPercentAllocation * 100).toFixed(2)}%`
    );
    console.log(
      `Current WETH Allocation: ${(wethPercentAllocation * 100).toFixed(2)}%`
    );

    let needsRebalance =
      Math.abs(usdcPercentAllocation - this.TARGET_ALLOCATIONS.usdc) >
        this.BUFFER ||
      Math.abs(wethPercentAllocation - this.TARGET_ALLOCATIONS.weth) >
        this.BUFFER;

    if (needsRebalance) {
      console.log("Rebalancing needed!");
      let trades = this.calculateRebalancingTrades(
        {
          balance: usdcBalance / this.SIX_DECIMALS,
          price: this.getPrice("usdc_usd_price_feed"),
        },
        {
          balance: wethBalance / this.EIGHTEEN_DECIMALS,
          price: this.getPrice("eth_usd_price_feed"),
        }
      );
      console.log("Trades to execute:", trades);
    }
  }
}

// Example usage
const rebalancer = new RebalancePortfolio({ usdc: 0.3, weth: 0.7 }, 0.1);
rebalancer.rebalance(5000000, 1500000000000000000);
