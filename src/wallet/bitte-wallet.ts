import {
  setupWalletSelector,
  VerifiedOwner,
  VerifyOwnerParams,
  Wallet,
} from "@near-wallet-selector/core";
import { setupIntearWallet } from "@near-wallet-selector/intear-wallet";
import { setupModal } from "@near-wallet-selector/modal-ui";
import { distinctUntilChanged, map, Subscription } from "rxjs";

import {
  WALLET_CONNECTION_POLL_INTERVAL,
  WALLET_CONNECTION_TIMEOUT,
} from "./constants";

import type {
  AccountState,
  WalletModuleFactory,
  WalletSelector,
} from "@near-wallet-selector/core";
import type { WalletSelectorModal } from "@near-wallet-selector/modal-ui";

import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
import { setupOKXWallet } from "@near-wallet-selector/okx-wallet";
import { setupHotWallet } from "@near-wallet-selector/hot-wallet";

const SUPPORT =
  "- further help available on our telegram channel: https://t.me/mintdev";

export const ERROR_MESSAGES = {
  WALLET_SETUP_NOT_CALLED_ERROR: `Call and await setupWalletSelectorComponents() before registering a subscriber - ${SUPPORT}`,
  WALLET_CONNECTION_NOT_FOUND: `Wallet connection not received after ${WALLET_CONNECTION_TIMEOUT}ms - ${SUPPORT}`,
};

export const SUPPORTED_NEAR_WALLETS: Array<WalletModuleFactory> = [
  setupMeteorWallet(),
  // setupMyNearWallet(),
  // setupHereWallet(),
  setupIntearWallet(),
  setupOKXWallet(),
  setupHotWallet(),
];

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
    selector: null,
    modal: null,
  },
  setupBitteWalletSelector: async (
    onlyBitteWallet = false,
    network?: "testnet" | "mainnet",
    options?: { additionalWallets?: Array<WalletModuleFactory> },
    contractAddress?: string,
    walletUrl?: string,
  ): Promise<WalletSelectorComponents> => {
    if (onlyBitteWallet === false) {
      BitteWalletAuth.walletSelectorComponents.selector =
        await setupWalletSelector({
          network: network || "mainnet",
          modules: [
            ...(options?.additionalWallets || []),
            ...SUPPORTED_NEAR_WALLETS,
          ],
        });
    } else {
      BitteWalletAuth.walletSelectorComponents.selector =
        await setupWalletSelector({
          network: network || "mainnet",
          modules: [...SUPPORTED_NEAR_WALLETS],
        });
    }

    BitteWalletAuth.walletSelectorComponents.modal = setupModal(
      BitteWalletAuth.walletSelectorComponents.selector,
      {
        contractId: contractAddress,
      },
    );

    return BitteWalletAuth.walletSelectorComponents;
  },
  setupWalletSelectorComponents: async (
    network?,
    contractAddress?,
    options?: { additionalWallets?: Array<WalletModuleFactory> },
  ): Promise<WalletSelectorComponents> => {
    const selector = await setupWalletSelector({
      network: network,
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
    return BitteWalletAuth.walletSelectorComponents;
  },
  SetupNotCalledError: class extends Error {
    constructor(message?: string) {
      super(message);
      this.name = "SetupNotCalledError";
    }
  },
  ConnectionTimeoutError: class extends Error {
    message: string;
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

    return BitteWalletAuth.walletSelectorComponents.selector.store.observable
      .pipe(
        map((state: any) => state.accounts),
        distinctUntilChanged(),
      )
      .subscribe(callback);
  },
  timerReference: null,
  pollForWalletConnection: async (): Promise<AccountState[]> => {
    BitteWalletAuth.validateWalletComponentsAreSetup();
    // clear any existing timer
    clearTimeout(BitteWalletAuth.timerReference);

    const tryToResolveAccountsFromState = (
      resolve: (value: AccountState[]) => void,
      reject: (err: ConnectionTimeoutError) => void,
      elapsed = 0,
    ): void => {
      const { accounts } =
        BitteWalletAuth.walletSelectorComponents.selector.store.getState() ||
        {};

      // accounts present in state
      if (accounts) {
        resolve(accounts);
      }

      // timed out
      if (elapsed > WALLET_CONNECTION_TIMEOUT) {
        reject(
          new ConnectionTimeoutError(
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

    return await BitteWalletAuth.walletSelectorComponents.selector.wallet();
  },
  connectWalletSelector: (): void => {
    BitteWalletAuth.validateWalletComponentsAreSetup();

    BitteWalletAuth.walletSelectorComponents.modal.show();
  },
  disconnectFromWalletSelector: async (): Promise<void> => {
    BitteWalletAuth.validateWalletComponentsAreSetup();

    const wallet =
      await BitteWalletAuth.walletSelectorComponents.selector.wallet();
    wallet.signOut();
  },
  getVerifiedOwner: async (
    params: VerifyOwnerParams,
  ): Promise<VerifiedOwner | undefined> => {
    BitteWalletAuth.validateWalletComponentsAreSetup();

    const { message, callbackUrl, meta } = params;

    const wallet =
      await BitteWalletAuth.walletSelectorComponents.selector.wallet();

    const owner = (await wallet.verifyOwner({
      message: message,
      callbackUrl: callbackUrl,
      meta: meta,
    })) as VerifiedOwner;

    return owner;
  },
  signMessage: async (params: VerifyOwnerParams): Promise<VerifiedOwner> => {
    const owner = await BitteWalletAuth.getVerifiedOwner(params);

    return owner;
  },
};
