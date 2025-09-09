import { useEffect, useState } from "react";

type UseNearPriceReturn = {
  nearPrice: number;
  error: string | null;
};

export const useNearPrice = (): UseNearPriceReturn => {
  const [price, setPrice] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const nearPriceData = async (): Promise<void> => {
      const { data, error } = await nearPrice();
      if (error) {
        setError(error);
        return;
      }
      setPrice(Number(data));
    };
    nearPriceData();
  }, []);

  return {
    nearPrice: price,
    error,
  };
};

// Coppied from archived repo: https://github.com/Mintbase/mintbase-js/blob/1661bb879eae3ae4f3e525e69bb2c1aeed1ef77f/packages/data/src/api/nearPrice/nearPrice.ts#L17
const BINANCE_API =
  "https://api.binance.com/api/v3/ticker/price?symbol=NEARUSDT";

export interface ParsedDataReturn<T> {
  error?: null | string;
  data?: T | null;
}

export interface NearPriceData {
  price?: string;
}
export interface CoinGeckoNearPriceData {
  near?: {
    usd: string;
  };
}

export const nearPrice = async (): Promise<ParsedDataReturn<string>> => {
  try {
    const req = await fetch(BINANCE_API);
    const data: NearPriceData = await req.json();
    return { data: data.price || "0" };
  } catch (err: unknown) {
    console.error(`Failed to retrieve near price ${err}`);
    return { data: "0" };
  }
};
