
export const QUERY_NEW_PUMPFUN_TOKENS = `
query {
  Solana {
    TokenSupplyUpdates(
      limit:{count:100}
      orderBy:{descending:Block_Time}
      where: {Instruction: {Program: {Address: {is: "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"}, Method: {in: ["create","create_v2"]}}}}
    ) {
      Block { Time }
      Transaction { Signer }
      TokenSupplyUpdate {
        Amount
        Currency {
          Symbol
          Name
          MintAddress
        }
        PostBalance
      }
    }
  }
}
`;


export const QUERY_TOP_PUMPFUN_TOKENS_5MIN = `
query MyQuery {
  Solana {
    DEXTradeByTokens(
      limit: {count: 10}
      orderBy:{descendingByField:"Marketcap_Change_5min"}
      where: {
        Trade: {Dex: {ProgramAddress: {is: "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"}}},
        Transaction: {Result: {Success: true}},
        Block: {Time: {since_relative: {hours_ago: 6}}}
      }
    ) {
      Trade {
        Currency {
          Name
          Symbol
          MintAddress
        }
        Price_5min_ago: PriceInUSD(minimum:Block_Time if:{Block:{Time:{since_relative:{minutes_ago:5}}}})
        Price_1h_ago: PriceInUSD(minimum:Block_Time if:{Block:{Time:{since_relative:{hours_ago:1}}}})
        Price_6h_ago: PriceInUSD(minimum: Block_Time)
        CurrentPrice: PriceInUSD(maximum: Block_Time)
      }
      Marketcap_Change_5min: calculate(expression: "(($Trade_CurrentPrice - $Trade_Price_5min_ago) / $Trade_Price_5min_ago) * 100")
      Marketcap_Change_1h: calculate(expression: "(($Trade_CurrentPrice - $Trade_Price_1h_ago) / $Trade_Price_1h_ago) * 100")
      Marketcap_Change_6h: calculate(expression: "(($Trade_CurrentPrice - $Trade_Price_6h_ago) / $Trade_Price_6h_ago) * 100")
    }
  }
}
`;
