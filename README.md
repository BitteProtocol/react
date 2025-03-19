# @bitte-ai/react

This package contains React helpers for interacting with Bitte Wallet.

<p align="center">

<img  src='https://img.shields.io/npm/dw/@bitte-ai/react'  />

<img  src='https://img.shields.io/bundlephobia/min/@bitte-ai/react'>

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

{% code title="app.tsx" overflow="wrap" lineNumbers="true" %}

## properties:

**network** : ` mainnet | testnet`

**additionalWallets** : `WalletModuleFactory[] extra wallets setup`

```typescript
import "@near-wallet-selector/modal-ui/styles.css";
import { BitteWalletContextProvider } from  '@bitte-ai/react'

<BitteWalletContextProvider
  network="mainnet"
>
   <Component {...pageProps} />
</BitteWalletContextProvider>

```

# Troubleshooting
The wallet runs only on client-side.

Any other questions or issues you can contact support on our [Telegram Channel](https://telegram.me/mintdev).


## License

This repository is distributed under the terms of both the MIT license and the Apache License (Version 2.0).