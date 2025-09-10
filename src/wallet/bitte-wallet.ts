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

// Wallet imports now handled by wallet-registry

import {
  SupportedWalletType,
  WalletSetupOptions,
  createWalletModules,
  DEFAULT_SUPPORTED_WALLETS,
  DEFAULT_BITTE_WALLETS,
} from "./wallet-registry";

const SUPPORT =
  "- further help available on our telegram channel: https://t.me/mintdev";

export const ERROR_MESSAGES = {
  WALLET_SETUP_NOT_CALLED_ERROR: `Call and await setupWalletSelectorComponents() before registering a subscriber - ${SUPPORT}`,
  WALLET_CONNECTION_NOT_FOUND: `Wallet connection not received after ${WALLET_CONNECTION_TIMEOUT}ms - ${SUPPORT}`,
};

// Legacy support - use wallet registry instead
export const SUPPORTED_NEAR_WALLETS: Array<WalletModuleFactory> =
  createWalletModules(DEFAULT_SUPPORTED_WALLETS);

export type WalletSelectorComponents = {
  selector: WalletSelector;
  modal: WalletSelectorModal;
};

type InternalWalletSelectorComponents = {
  selector: WalletSelector | null;
  modal: WalletSelectorModal | null;
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
    selector: null,
    modal: null,
  } as InternalWalletSelectorComponents,
  setupBitteWalletSelector: async (
    onlyBitteWallet = false,
    network?: "testnet" | "mainnet",
    options?: {
      additionalWallets?: Array<WalletModuleFactory>;
      wallets?: SupportedWalletType[];
      walletOptions?: Record<SupportedWalletType, WalletSetupOptions>;
    },
    contractAddress?: string,
    walletUrl?: string,
  ): Promise<WalletSelectorComponents> => {
    // Handle new wallet configuration system
    if (options?.wallets) {
      const walletModules = createWalletModules(
        options.wallets,
        options.walletOptions,
      );

      BitteWalletAuth.walletSelectorComponents.selector =
        await setupWalletSelector({
          network: network || "mainnet",
          modules: walletModules,
        });
    } else if (onlyBitteWallet === false) {
      // Legacy behavior: include all supported wallets
      BitteWalletAuth.walletSelectorComponents.selector =
        await setupWalletSelector({
          network: network || "mainnet",
          modules: [
            setupBitteWallet() as WalletModuleFactory<Wallet>,
            ...(options?.additionalWallets || []),
            ...SUPPORTED_NEAR_WALLETS,
          ],
        });
    } else {
      // Legacy behavior: only Bitte wallet
      BitteWalletAuth.walletSelectorComponents.selector =
        await setupWalletSelector({
          network: network || "mainnet",
          modules: [
            setupBitteWallet({
              walletUrl:
                walletUrl || walletUrls[network as "mainnet" | "testnet"],
            }) as WalletModuleFactory<Wallet>,
            ...(options?.additionalWallets || []),
          ],
        });
    }

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
    options?: { additionalWallets?: Array<WalletModuleFactory> },
  ): Promise<WalletSelectorComponents> => {
    const selector = await setupWalletSelector({
      network: network || "mainnet",
      modules: [
        ...SUPPORTED_NEAR_WALLETS,
        ...(options?.additionalWallets || []),
      ],
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
    constructor(message: string) {
      super(message);
      this.message = message;
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
  ): Subscription => {
    BitteWalletAuth.validateWalletComponentsAreSetup();

    return (
      BitteWalletAuth.walletSelectorComponents.selector!.store.observable as any
    )
      .pipe(
        map((state: any) => state.accounts),
        distinctUntilChanged(),
      )
      .subscribe(callback);
  },
  timerReference: null as NodeJS.Timeout | null,
  pollForWalletConnection: async (): Promise<AccountState[]> => {
    BitteWalletAuth.validateWalletComponentsAreSetup();
    // clear any existing timer
    if (BitteWalletAuth.timerReference) {
      clearTimeout(BitteWalletAuth.timerReference);
    }

    const tryToResolveAccountsFromState = (
      resolve: (value: AccountState[]) => void,
      reject: (err: ConnectionTimeoutError) => void,
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
      if (BitteWalletAuth.timerReference) {
        clearTimeout(BitteWalletAuth.timerReference);
      }
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

    return owner;
  },
  signMessage: async (params: VerifyOwnerParams): Promise<VerifiedOwner> => {
    const owner = await BitteWalletAuth.getVerifiedOwner(params);
    if (!owner) {
      throw new Error("Failed to get verified owner");
    }
    return owner;
  },
};
