# @bitte-ai/react

This package contains React helpers for interacting with Bitte Wallet.

<p align="center">

<img  src='https://img.shields.io/npm/dw/@bitte-ai/react'  />

</p>


## Summary

- [Installing](#Installing)

- [BitteWalletContextProvider (default)](#bittewalletcontextprovider) : The default Bitte Wallet provider


# Installing

### NPM:

```
npm install @bitte-ai/react
npm install @near-wallet-selector/modal-ui
```

### Yarn:

```
yarn add @bitte-ai/react
yarn add @near-wallet-selector/modal-ui
```

### PNPM:

```
pnpm install @bitte-ai/react
pnpm install @near-wallet-selector/modal-ui
```

# BitteWalletContextProvider

the default way of interacting with Bitte Wallet is using the BitteWalletContextProvider


## Properties:

### Core Properties
**network** : `mainnet | testnet` - NEAR network to connect to

**contractAddress** : `string` - Contract address for the wallet modal

### New Customizable Wallet Selection (Recommended)
**wallets** : `SupportedWalletType[]` - Array of wallet keywords you want to include

**walletOptions** : `Record<SupportedWalletType, WalletSetupOptions>` - Configuration options for each wallet

### Legacy Properties (Deprecated)
**additionalWallets** : `WalletModuleFactory[]` - Extra wallets setup

**onlyBitteWallet** : `boolean` - Only show Bitte wallet

**walletUrl** : `string` - Custom Bitte wallet URL

## Basic Usage

### New Customizable Approach (Recommended)

```typescript
import "@near-wallet-selector/modal-ui/styles.css";
import { BitteWalletContextProvider, SupportedWalletType } from '@bitte-ai/react'

// Choose exactly which wallets you want
const wallets: SupportedWalletType[] = ["bitte", "intear", "meteor", "okx", "hot"];

<BitteWalletContextProvider
  network="mainnet"
  wallets={wallets}
>
   <Component {...pageProps} />
</BitteWalletContextProvider>
```

### Legacy Usage (Still Supported)

```typescript
import "@near-wallet-selector/modal-ui/styles.css";
import { BitteWalletContextProvider } from '@bitte-ai/react'

<BitteWalletContextProvider
  network="mainnet"
>
   <Component {...pageProps} />
</BitteWalletContextProvider>
```

## Supported Wallets

- `"bitte"` - Bitte Wallet
- `"meteor"` - Meteor Wallet  
- `"here"` - HERE Wallet
- `"mynear"` - MyNearWallet
- `"intear"` - Intear Wallet
- `"okx"` - OKX Wallet
- `"hot"` - HOT Wallet

## Examples

### Only Bitte Wallet
```typescript
<BitteWalletContextProvider
  network="mainnet"
  wallets={["bitte"]}
>
   <YourApp />
</BitteWalletContextProvider>
```

### Multiple Wallets with Options
```typescript
<BitteWalletContextProvider
  network="mainnet"
  wallets={["bitte", "meteor", "intear", "okx", "hot"]}
  walletOptions={{
    bitte: { walletUrl: "https://custom.wallet.url" }
  }}
>
   <YourApp />
</BitteWalletContextProvider>
```

For more detailed examples and migration guide, see [WALLET_CUSTOMIZATION.md](./WALLET_CUSTOMIZATION.md).

# Troubleshooting
The wallet runs only on client-side.

Any other questions or issues you can contact support on our [Telegram Channel](https://telegram.me/mintdev).


## License

This repository is distributed under the terms of both the MIT license and the Apache License (Version 2.0).
