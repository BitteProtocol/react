import React, {
  createContext,
  JSX,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { BitteWalletAuth } from "./wallet/bitte-wallet";
import type { WalletSelectorComponents } from "./wallet/bitte-wallet";

import type {
  WalletSelector,
  AccountState,
  VerifiedOwner,
  VerifyOwnerParams,
  WalletModuleFactory,
} from "@near-wallet-selector/core";
import type { WalletSelectorModal } from "@near-wallet-selector/modal-ui";

export type BitteWalletContext = {
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

interface ContextProviderType {
  children: React.ReactNode;
  network?:  'testnet' | 'mainnet';
  onlyMbWallet?: boolean;
  contractAddress?: string;
  additionalWallets?: Array<WalletModuleFactory>;
  onlyBitteWallet?: boolean;
  walletUrl?:string
}

export const BitteWalletContext = createContext<BitteWalletContext | null>(
  null
);

export const BitteWalletContextProvider: React.FC<ContextProviderType> = ({
  children,
  network,
  contractAddress,
  additionalWallets,
  onlyBitteWallet,
  walletUrl,
}): JSX.Element => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [components, setComponents] = useState<WalletSelectorComponents | null>(
    null
  );
  const [accounts, setAccounts] = useState<AccountState[]>([]);
  const [isWaitingForConnection, setIsWaitingForConnection] =
    useState<boolean>(false);
  const [isWalletSelectorSetup, setIsWalletSelectorSetup] =
    useState<boolean>(false);

  const selectedNetwork = network;
  const selectedContract = contractAddress;

  const {
    setupBitteWalletSelector,
    registerWalletAccountsSubscriber,
    connectWalletSelector,
    pollForWalletConnection,
    disconnectFromWalletSelector,
    signMessage,
  } = BitteWalletAuth;

  const setupBitteWallet = async (): Promise<WalletSelectorComponents> => {
    const isOnlyBitteWallet =
      !!onlyBitteWallet ||
      !!(additionalWallets && additionalWallets.length > 0);


    return await setupBitteWalletSelector(
      isOnlyBitteWallet,
      selectedNetwork,
     {additionalWallets: additionalWallets },
      walletUrl
    );
  };

  const setup = useCallback(async () => {
    const components = await setupBitteWallet();

    setIsWalletSelectorSetup(true);
    setComponents(components);
  }, []);

  const onCloseModal = (): void => {
    setIsWaitingForConnection(false);
  };

  const setupWallet = async (): Promise<WalletSelectorComponents> => {
    const components = await setupBitteWallet();

    return components;
  };

  // call setup on wallet selector

  useEffect(() => {
    setupWallet();

    setup().catch((err: Error) => {
      if (err instanceof Error && err.message.length > 0) {
        setErrorMessage(err.message);
      }
    });

    // Add the event listener here
    const closeButton = document?.getElementsByClassName("close-button")[0];
    closeButton?.addEventListener("click", onCloseModal);

    // Cleanup the event listener on unmount
    return (): void => {
      closeButton?.removeEventListener("click", onCloseModal);
    };
  }, [setup]);

  // subscribe to account state changes
  useEffect(() => {
    if (!components) {
      return undefined;
    }

    const subscription = registerWalletAccountsSubscriber(
      (accounts: AccountState[]) => {
        setAccounts(accounts);
      }
    );

    return (): void => {
      subscription.unsubscribe();
    };
  }, [components]);

  const { selector, modal } = components || {};



  const connect = async (): Promise<void> => {
    setIsWaitingForConnection(true);

    setErrorMessage(null);
    connectWalletSelector();

    try {
      const accounts = await pollForWalletConnection();
      setIsWaitingForConnection(false);
      setAccounts(accounts);
    } catch (err: unknown) {
      if (err) {
        setErrorMessage((err as Error).message);
      }
    }
  };

  const disconnect = async (): Promise<void> => {
    await disconnectFromWalletSelector();
    setIsWaitingForConnection(false);
  };

  const contextVal = useMemo<BitteWalletContext>(
    () => ({
      selector: selector as WalletSelector,
      modal: modal,
      accounts: accounts,
      activeAccountId:
        accounts.find((account) => account.active)?.accountId || null,
      isConnected: accounts && accounts.length > 0,
      isWaitingForConnection: isWaitingForConnection,
      isWalletSelectorSetup: isWalletSelectorSetup,
      errorMessage: errorMessage,
      connect,
      disconnect,
      signMessage,
    }),
    [selector, modal, accounts]
  );

  return (
    <BitteWalletContext.Provider value={contextVal}>
      {children}
    </BitteWalletContext.Provider>
  );
};

export const useBitteWallet = (): BitteWalletContext => {
  const context = useContext(BitteWalletContext);
  if (!context) {
    throw new Error(
      "useBitteWallet must be used within a BitteWalletContextProvider"
    );
  }
  return context;
};
