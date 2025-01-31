import { useEffect, useState } from 'react';
import { nearPrice } from '@mintbase-js/data';

type UseNearPriceReturn = {
  nearPrice: number;
  error: string | null;
}

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
