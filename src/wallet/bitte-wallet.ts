import {
  setupWalletSelector,
  VerifiedOwner,
  VerifyOwnerParams,
  Wallet,
} from "@near-wallet-selector/core";
import { setupModal } from "@near-wallet-selector/modal-ui";
import { map, distinctUntilChanged, Subscription } from "rxjs";

import {
  WALLET_CONNECTION_POLL_INTERVAL,
  WALLET_CONNECTION_TIMEOUT,
} from "./constants";

import type {
  WalletSelector,
  AccountState,
  WalletModuleFactory,
} from "@near-wallet-selector/core";
import type { WalletSelectorModal } from "@near-wallet-selector/modal-ui";

import { setupBitteWallet } from "@bitte-ai/wallet";

import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
import { setupHereWallet } from "@near-wallet-selector/here-wallet";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import { setupIntearWallet } from "@near-wallet-selector/intear-wallet";
import { setupOKXWallet } from "@near-wallet-selector/okx-wallet";

const SUPPORT =
  "- further help available on our telegram channel: https://t.me/mintdev";

export const ERROR_MESSAGES = {
  WALLET_SETUP_NOT_CALLED_ERROR: `Call and await setupWalletSelectorComponents() before registering a subscriber - ${SUPPORT}`,
  WALLET_CONNECTION_NOT_FOUND: `Wallet connection not received after ${WALLET_CONNECTION_TIMEOUT}ms - ${SUPPORT}`,
};

// Supported wallet configurations
export type WalletName =
  | "intear"
  | "hot"
  | "okx"
  | "bitte"
  | "meteor"
  | "mynear";

export const WALLET_MODULES: Record<WalletName, () => WalletModuleFactory> = {
  intear: () => setupIntearWallet(),
  hot: () => setupHereWallet(), // "hot" maps to HereWallet
  okx: () => setupOKXWallet(),
  bitte: () => setupBitteWallet() as WalletModuleFactory<Wallet>,
  meteor: () => setupMeteorWallet(),
  mynear: () => setupMyNearWallet(),
};

// Default supported wallets (backwards compatibility)
export const SUPPORTED_NEAR_WALLETS: Array<WalletModuleFactory> = [
  setupMeteorWallet(),
  setupMyNearWallet(),
  setupHereWallet(),
];

// Helper function to get wallet modules from names
export const getWalletModulesFromNames = (
  walletNames: WalletName[],
): Array<WalletModuleFactory> => {
  return walletNames.map((name) => {
    const moduleFactory = WALLET_MODULES[name];
    if (!moduleFactory) {
      throw new Error(`Unsupported wallet: ${name}`);
    }
    return moduleFactory();
  });
};

export type WalletSelectorComponents = {
  selector: WalletSelector;
  modal: WalletSelectorModal;
};

interface ConnectionTimeoutError extends Error {
  message: string;
}

const walletUrls = {
  testnet: "https://testnet.wallet.bitte.ai/",
  mainnet: "https://wallet.bitte.ai",
};

export const BitteWalletAuth = {
  walletSelectorComponents: {
    selector: null as WalletSelector | null,
    modal: null as WalletSelectorModal | null,
  },
  setupBitteWalletSelector: async (
    onlyBitteWallet = false,
    network?: "testnet" | "mainnet",
    options?: {
      additionalWallets?: Array<WalletModuleFactory>;
      enabledWallets?: WalletName[];
    },
    contractAddress?: string,
    walletUrl?: string,
  ): Promise<WalletSelectorComponents> => {
    // Determine which wallets to include
    const walletModules: Array<WalletModuleFactory> = [];

    if (options?.enabledWallets && options.enabledWallets.length > 0) {
      // Use enabledWallets if specified
      walletModules.push(...getWalletModulesFromNames(options.enabledWallets));
    } else if (onlyBitteWallet === false) {
      // Legacy behavior: include Bitte + default wallets
      walletModules.push(
        setupBitteWallet() as WalletModuleFactory<Wallet>,
        ...SUPPORTED_NEAR_WALLETS,
      );
    } else {
      // Only Bitte wallet
      walletModules.push(
        setupBitteWallet({
          walletUrl: walletUrl || walletUrls[network as "mainnet" | "testnet"],
        }) as WalletModuleFactory<Wallet>,
      );
    }

    // Add any additional wallets
    if (options?.additionalWallets) {
      walletModules.push(...options.additionalWallets);
    }

    BitteWalletAuth.walletSelectorComponents.selector =
      await setupWalletSelector({
        network: network || "mainnet",
        modules: walletModules,
      });

    BitteWalletAuth.walletSelectorComponents.modal = setupModal(
      BitteWalletAuth.walletSelectorComponents.selector,
      {
        contractId: contractAddress,
      },
    );

    return BitteWalletAuth.walletSelectorComponents as WalletSelectorComponents;
  },
  setupWalletSelectorComponents: async (
    network?: "testnet" | "mainnet",
    contractAddress?: string,
    options?: {
      additionalWallets?: Array<WalletModuleFactory>;
      enabledWallets?: WalletName[];
    },
  ): Promise<WalletSelectorComponents> => {
    // Determine which wallets to include
    const walletModules: Array<WalletModuleFactory> = [];

    if (options?.enabledWallets && options.enabledWallets.length > 0) {
      // Use enabledWallets if specified
      walletModules.push(...getWalletModulesFromNames(options.enabledWallets));
    } else {
      // Default behavior: use SUPPORTED_NEAR_WALLETS
      walletModules.push(...SUPPORTED_NEAR_WALLETS);
    }

    // Add any additional wallets
    if (options?.additionalWallets) {
      walletModules.push(...options.additionalWallets);
    }

    const selector = await setupWalletSelector({
      network: network || "mainnet",
      modules: walletModules,
    });

    const modal = setupModal(selector, {
      contractId: contractAddress,
    });

    BitteWalletAuth.walletSelectorComponents = {
      selector,
      modal,
    };
    return BitteWalletAuth.walletSelectorComponents as WalletSelectorComponents;
  },
  SetupNotCalledError: class extends Error {
    constructor(message?: string) {
      super(message);
      this.name = "SetupNotCalledError";
    }
  },
  ConnectionTimeoutError: class extends Error {
    message: string;
    constructor(message?: string) {
      super(message);
      this.message = message || "";
      this.name = "ConnectionTimeoutError";
    }
  },
  validateWalletComponentsAreSetup: (): void => {
    if (!BitteWalletAuth.walletSelectorComponents.selector) {
      throw new BitteWalletAuth.SetupNotCalledError(
        ERROR_MESSAGES.WALLET_SETUP_NOT_CALLED_ERROR,
      );
    }
  },
  registerWalletAccountsSubscriber: (
    callback: (accounts: AccountState[]) => void,
  ): any => {
    BitteWalletAuth.validateWalletComponentsAreSetup();

    return (
      BitteWalletAuth.walletSelectorComponents.selector!.store.observable as any
    )
      .pipe(
        (map as any)((state: any) => state.accounts),
        (distinctUntilChanged as any)(),
      )
      .subscribe(callback);
  },
  timerReference: null as any,
  pollForWalletConnection: async (): Promise<AccountState[]> => {
    BitteWalletAuth.validateWalletComponentsAreSetup();
    // clear any existing timer
    clearTimeout(BitteWalletAuth.timerReference);

    const tryToResolveAccountsFromState = (
      resolve: (value: AccountState[]) => void,
      reject: (
        err: InstanceType<typeof BitteWalletAuth.ConnectionTimeoutError>,
      ) => void,
      elapsed = 0,
    ): void => {
      const { accounts } =
        BitteWalletAuth.walletSelectorComponents.selector!.store.getState() ||
        {};

      // accounts present in state
      if (accounts) {
        resolve(accounts);
      }

      // timed out
      if (elapsed > WALLET_CONNECTION_TIMEOUT) {
        reject(
          new BitteWalletAuth.ConnectionTimeoutError(
            ERROR_MESSAGES.WALLET_CONNECTION_NOT_FOUND,
          ),
        );
      }

      // try again
      clearTimeout(BitteWalletAuth.timerReference);
      BitteWalletAuth.timerReference = setTimeout(
        () =>
          tryToResolveAccountsFromState(
            resolve,
            reject,
            elapsed + WALLET_CONNECTION_POLL_INTERVAL,
          ),
        WALLET_CONNECTION_POLL_INTERVAL,
      );
    };

    return new Promise((resolve, reject) =>
      tryToResolveAccountsFromState(resolve, reject),
    );
  },
  getWallet: async (): Promise<Wallet> => {
    BitteWalletAuth.validateWalletComponentsAreSetup();

    return await BitteWalletAuth.walletSelectorComponents.selector!.wallet();
  },
  connectWalletSelector: (): void => {
    BitteWalletAuth.validateWalletComponentsAreSetup();

    BitteWalletAuth.walletSelectorComponents.modal!.show();
  },
  disconnectFromWalletSelector: async (): Promise<void> => {
    BitteWalletAuth.validateWalletComponentsAreSetup();

    const wallet =
      await BitteWalletAuth.walletSelectorComponents.selector!.wallet();
    wallet.signOut();
  },
  getVerifiedOwner: async (
    params: VerifyOwnerParams,
  ): Promise<VerifiedOwner | undefined> => {
    BitteWalletAuth.validateWalletComponentsAreSetup();

    const { message, callbackUrl, meta } = params;

    const wallet =
      await BitteWalletAuth.walletSelectorComponents.selector!.wallet();

    const owner = (await wallet.verifyOwner({
      message: message,
      callbackUrl: callbackUrl,
      meta: meta,
    })) as VerifiedOwner;

    return owner!;
  },
  signMessage: async (params: VerifyOwnerParams): Promise<VerifiedOwner> => {
    const owner = await BitteWalletAuth.getVerifiedOwner(params);

    return owner!;
  },
};
