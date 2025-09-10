import { WalletModuleFactory } from "@near-wallet-selector/core";
import { setupBitteWallet } from "@bitte-ai/wallet";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
import { setupHereWallet } from "@near-wallet-selector/here-wallet";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import { setupIntearWallet } from "@near-wallet-selector/intear-wallet";
import { setupOKXWallet } from "@near-wallet-selector/okx-wallet";
import { setupHotWallet } from "@near-wallet-selector/hot-wallet";

export type SupportedWalletType =
  | "bitte"
  | "meteor"
  | "here"
  | "mynear"
  | "intear"
  | "okx"
  | "hot";

export interface WalletConfig {
  name: SupportedWalletType;
  setupFunction: (options?: any) => any;
  defaultOptions?: any;
}

export const WALLET_REGISTRY: Record<SupportedWalletType, WalletConfig> = {
  bitte: {
    name: "bitte",
    setupFunction: setupBitteWallet,
    defaultOptions: {},
  },
  meteor: {
    name: "meteor",
    setupFunction: setupMeteorWallet,
    defaultOptions: {},
  },
  here: {
    name: "here",
    setupFunction: setupHereWallet,
    defaultOptions: {},
  },
  mynear: {
    name: "mynear",
    setupFunction: setupMyNearWallet,
    defaultOptions: {},
  },
  intear: {
    name: "intear",
    setupFunction: setupIntearWallet,
    defaultOptions: {},
  },
  okx: {
    name: "okx",
    setupFunction: setupOKXWallet,
    defaultOptions: {},
  },
  hot: {
    name: "hot",
    setupFunction: setupHotWallet,
    defaultOptions: {},
  },
};

export interface WalletSetupOptions {
  walletUrl?: string;
  [key: string]: any;
}

/**
 * Creates wallet modules based on the provided wallet types and options
 */
export function createWalletModules(
  walletTypes: SupportedWalletType[],
  options?: Record<SupportedWalletType, WalletSetupOptions>,
): Array<WalletModuleFactory> {
  return walletTypes.map((walletType) => {
    const config = WALLET_REGISTRY[walletType];
    if (!config) {
      throw new Error(`Unsupported wallet type: ${walletType}`);
    }

    const walletOptions = options?.[walletType] || config.defaultOptions;
    return config.setupFunction(walletOptions) as WalletModuleFactory;
  });
}

/**
 * Default wallet configurations for backward compatibility
 */
export const DEFAULT_SUPPORTED_WALLETS: SupportedWalletType[] = [
  "meteor",
  "mynear",
  "here",
];

export const DEFAULT_BITTE_WALLETS: SupportedWalletType[] = ["bitte"];
