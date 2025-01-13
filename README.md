# @bitte-ai/react

This package contains React helpers for interacting with Bitte Wallet.

<p align="center">

<img  src='https://img.shields.io/npm/dw/@bitte-ai/react'  />

<img  src='https://img.shields.io/bundlephobia/min/@bitte-ai/react'>

</p>

Example:
You can check a [quick example of Simple Login](https://github.com/Mintbase/examples/tree/main/starter) using Next.js 14 and @mintbase-js/react


[Check our Templates repository for Mintbase.js](https://github.com/Mintbase/templates)

[Live Demo](https://starter.mintbase.xyz/)

## Summary

- [Installing](#Installing)

- [BitteWalletContextProvider (default)](#bittewalletcontextprovider) : The default Bitte Wallet provider


# Installing

`@bitte-ai/react relies on React and React Dom version v18.2.0 due to @near-wallet-selector/modal-ui`

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

the default way of interacting with Mintbase Wallet is using the BitteWalletContextProvider

{% code title="app.tsx" overflow="wrap" lineNumbers="true" %}

## properties:

**contractAddress** (optional): `If you set this it will connect the user using Limited Access Keys, set with your near contract address / your mintbase store address`

**network** : ` mainnet | testnet`

**callbackUrl** : `a valid https/http address to the user be sent after the transaction`

**onlyMbWallet** : `boolean, it sets up only MintbaseWallet or if false(default) MintbaseWallet + default wallets`

**additionalWallets** : `WalletModuleFactory[] extra wallets setup`

```typescript
import "@near-wallet-selector/modal-ui/styles.css";
import { BitteWalletContextProvider } from  '@bitte-ai/react'

<BitteWalletContextProvider
  contractAddress="mycontract.mintbase1.near"
  network="mainnet"
  callbackUrl="https://www.mywebsite.com/callback"
>
   <Component {...pageProps} />
</BitteWalletContextProvider>

```

# Troubleshooting
The wallet runs only on client-side.

Any other questions or issues you can contact support on our [Telegram Channel](https://telegram.me/mintdev).


## License

This repository is distributed under the terms of both the MIT license and the Apache License (Version 2.0).