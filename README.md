# @bitte-ai/react

This package contains React helpers for interacting with Bitte Wallet and other NEAR wallets.

<p align="center">

<img  src='https://img.shields.io/npm/dw/@bitte-ai/react'  />

</p>

## Summary

- [Installing](#installing)
- [Wallet Selection](#wallet-selection)
- [BitteWalletContextProvider](#bittewalletcontextprovider)
- [Available Wallets](#available-wallets)
- [Usage Examples](#usage-examples)
- [Legacy API](#legacy-api)
- [Troubleshooting](#troubleshooting)

# Installing

### NPM:

```bash
npm install @bitte-ai/react
npm install @near-wallet-selector/modal-ui
```

### Yarn:

```bash
yarn add @bitte-ai/react
yarn add @near-wallet-selector/modal-ui
```

### PNPM:

```bash
pnpm install @bitte-ai/react
pnpm install @near-wallet-selector/modal-ui
```

# Wallet Selection

You can now easily choose which wallets to display by using the `enabledWallets` prop. This gives developers full control over the wallet selection experience.

## Available Wallets

The following wallets are supported:

- `"intear"` - Intear Wallet
- `"hot"` - Here Wallet (formerly HOT Wallet)
- `"okx"` - OKX Wallet
- `"bitte"` - Bitte Wallet
- `"meteor"` - Meteor Wallet  
- `"mynear"` - MyNEAR Wallet

# BitteWalletContextProvider

The default way of interacting with Bitte Wallet is using the BitteWalletContextProvider.

## Properties:

**network**: `"mainnet" | "testnet"` - The NEAR network to connect to

**enabledWallets**: `WalletName[]` - Array of wallet names to display (recommended)

**additionalWallets**: `WalletModuleFactory[]` - Extra wallets setup

**contractAddress**: `string` - Contract address for wallet connection

**onlyBitteWallet**: `boolean` - Legacy prop to show only Bitte Wallet

**walletUrl**: `string` - Custom Bitte Wallet URL

# Usage Examples

## Basic Wallet Selection (Recommended)

```typescript
import "@near-wallet-selector/modal-ui/styles.css";
import { BitteWalletContextProvider, useBitteWallet, WalletName } from '@bitte-ai/react';

// Select only the wallets you want to show
const enabledWallets: WalletName[] = ['intear', 'hot', 'okx', 'bitte'];

function MyApp() {
  return (
    <BitteWalletContextProvider
      network="mainnet"
      enabledWallets={enabledWallets}
      contractAddress="your-contract.near"
    >
      <WalletConnector />
    </BitteWalletContextProvider>
  );
}

function WalletConnector() {
  const { connect, disconnect, isConnected, accounts } = useBitteWallet();
  
  return (
    <div>
      {!isConnected ? (
        <button onClick={connect}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected: {accounts[0]?.accountId}</p>
          <button onClick={disconnect}>Disconnect</button>
        </div>
      )}
    </div>
  );
}
```

## All Available Wallets

```typescript
const allWallets: WalletName[] = ['intear', 'hot', 'okx', 'bitte', 'meteor', 'mynear'];

<BitteWalletContextProvider
  network="mainnet"
  enabledWallets={allWallets}
  contractAddress="your-contract.near"
>
  <App />
</BitteWalletContextProvider>
```

## Only Specific Wallets

```typescript
// Only show Bitte and Intear wallets
const selectedWallets: WalletName[] = ['bitte', 'intear'];

<BitteWalletContextProvider
  network="testnet"
  enabledWallets={selectedWallets}
  contractAddress="your-contract.testnet"
>
  <App />
</BitteWalletContextProvider>
```

## Combining with Additional Wallets

```typescript
import { setupCustomWallet } from 'custom-wallet';

const myWallets: WalletName[] = ['bitte', 'intear', 'meteor'];

<BitteWalletContextProvider
  network="mainnet"
  enabledWallets={myWallets}
  additionalWallets={[setupCustomWallet()]}
  contractAddress="your-contract.near"
>
  <App />
</BitteWalletContextProvider>
```

## TypeScript Support

The `WalletName` type ensures you only use supported wallet names:

```typescript
import { WalletName } from '@bitte-ai/react';

// ✅ This works
const validWallets: WalletName[] = ['intear', 'bitte', 'meteor'];

// ❌ TypeScript error - 'invalid' is not a valid wallet name
const invalidWallets: WalletName[] = ['intear', 'invalid'];
```

# Legacy API

The previous API is still supported for backwards compatibility:

## Using onlyBitteWallet

```typescript
<BitteWalletContextProvider
  network="mainnet" 
  onlyBitteWallet={true}
  contractAddress="your-contract.near"
>
  <App />
</BitteWalletContextProvider>
```

## Using additionalWallets Only

```typescript
import { setupSomeCustomWallet } from 'some-custom-wallet';

<BitteWalletContextProvider
  network="mainnet"
  additionalWallets={[setupSomeCustomWallet()]}
  contractAddress="your-contract.near"
>
  <App />
</BitteWalletContextProvider>
```

## Important Notes

- If you don't specify `enabledWallets`, the default wallets (`meteor`, `mynear`, `hot`) plus `bitte` will be used
- If you specify an empty `enabledWallets` array, no wallets will be shown
- The `enabledWallets` option takes precedence over `onlyBitteWallet` when both are provided
- Additional wallets from `additionalWallets` will always be included regardless of the `enabledWallets` setting

# Troubleshooting
The wallet runs only on client-side.

Any other questions or issues you can contact support on our [Telegram Channel](https://telegram.me/mintdev).


## License

This repository is distributed under the terms of both the MIT license and the Apache License (Version 2.0).
