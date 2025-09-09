import React from 'react';
import { WalletSelector, AccountState, VerifyOwnerParams, VerifiedOwner, WalletModuleFactory } from '@near-wallet-selector/core';
export { Account, BrowserWallet, Wallet, WalletBehaviourFactory, WalletModule, WalletModuleFactory } from '@near-wallet-selector/core';
import { WalletSelectorModal } from '@near-wallet-selector/modal-ui';

interface ContextProviderType {
    children: React.ReactNode;
    network?: 'testnet' | 'mainnet';
    onlyMbWallet?: boolean;
    contractAddress?: string;
    additionalWallets?: Array<WalletModuleFactory>;
    onlyBitteWallet?: boolean;
    walletUrl?: string;
}
type BitteWalletContext = {
    selector: WalletSelector;
    modal: WalletSelectorModal | undefined;
    accounts: AccountState[];
    activeAccountId: string | null;
    isConnected: boolean;
    isWaitingForConnection: boolean;
    isWalletSelectorSetup: boolean;
    errorMessage: string | null;
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    signMessage: (params: VerifyOwnerParams) => Promise<VerifiedOwner>;
};
declare const BitteWalletContext: React.Context<BitteWalletContext | null>;
declare const BitteWalletContextProvider: React.FC<ContextProviderType>;
declare const useBitteWallet: () => BitteWalletContext;

type UseNearPriceReturn = {
    nearPrice: number;
    error: string | null;
};
declare const useNearPrice: () => UseNearPriceReturn;
interface ParsedDataReturn<T> {
    error?: null | string;
    data?: T | null;
}
interface NearPriceData {
    price?: string;
}
interface CoinGeckoNearPriceData {
    near?: {
        usd: string;
    };
}
declare const nearPrice: () => Promise<ParsedDataReturn<string>>;

export { BitteWalletContext, BitteWalletContextProvider, type CoinGeckoNearPriceData, type NearPriceData, type ParsedDataReturn, nearPrice, useBitteWallet, useNearPrice };
