# Wallet Customization Guide

This guide shows how to use the new customizable wallet system in `@bitte-ai/react`.

## Overview

The new system allows you to specify exactly which wallets you want to include by passing an array of wallet keywords to the `wallets` prop. This gives you full control over which wallets are available to your users.

## Supported Wallet Types

| Keyword | Wallet Name | Description |
|---------|-------------|-------------|
| `"bitte"` | Bitte Wallet | The Bitte AI wallet |
| `"meteor"` | Meteor Wallet | Popular NEAR wallet |
| `"here"` | HERE Wallet | Mobile-first NEAR wallet |
| `"mynear"` | MyNearWallet | Official NEAR wallet |
| `"intear"` | Intear Wallet | Intear wallet for NEAR |
| `"okx"` | OKX Wallet | OKX exchange wallet for NEAR |
| `"hot"` | HOT Wallet | HOT wallet for NEAR |

## Basic Usage

### New Customizable Approach

```tsx
import { BitteWalletContextProvider, SupportedWalletType } from "@bitte-ai/react";

function App() {
  // Only include Bitte, Intear, and OKX wallets
  const wallets: SupportedWalletType[] = ["bitte", "intear", "okx"];

  return (
    <BitteWalletContextProvider
      network="mainnet"
      wallets={wallets}
    >
      <YourAppContent />
    </BitteWalletContextProvider>
  );
}
```

### With Wallet-Specific Options

```tsx
import { 
  BitteWalletContextProvider, 
  SupportedWalletType,
  WalletSetupOptions 
} from "@bitte-ai/react";

function App() {
  const wallets: SupportedWalletType[] = ["bitte", "meteor", "intear", "okx", "hot"];
  
  const walletOptions = {
    bitte: {
      walletUrl: "https://custom-wallet.bitte.ai"
    },
    // Other wallets will use their default options
  };

  return (
    <BitteWalletContextProvider
      network="mainnet"
      wallets={wallets}
      walletOptions={walletOptions}
    >
      <YourAppContent />
    </BitteWalletContextProvider>
  );
}
```

## Common Use Cases

### Only Bitte Wallet
```tsx
<BitteWalletContextProvider
  network="mainnet"
  wallets={["bitte"]}
>
  <YourApp />
</BitteWalletContextProvider>
```

### All Available Wallets
```tsx
<BitteWalletContextProvider
  network="mainnet"
  wallets={["bitte", "meteor", "here", "mynear", "intear", "okx", "hot"]}
>
  <YourApp />
</BitteWalletContextProvider>
```

### Mobile-Focused Setup
```tsx
<BitteWalletContextProvider
  network="mainnet"
  wallets={["here", "meteor", "bitte", "hot"]}
>
  <YourApp />
</BitteWalletContextProvider>
```

### DeFi/Trading Apps
```tsx
<BitteWalletContextProvider
  network="mainnet"
  wallets={["meteor", "mynear", "bitte", "okx"]}
>
  <YourApp />
</BitteWalletContextProvider>
```

### Exchange-Focused Setup
```tsx
<BitteWalletContextProvider
  network="mainnet"
  wallets={["okx", "meteor", "bitte"]}
>
  <YourApp />
</BitteWalletContextProvider>
```

## Backward Compatibility

The package still supports the legacy props for backward compatibility:

```tsx
// Legacy approach (still works)
<BitteWalletContextProvider
  network="mainnet"
  onlyBitteWallet={true}
  walletUrl="https://wallet.bitte.ai"
>
  <YourApp />
</BitteWalletContextProvider>
```

However, we recommend migrating to the new `wallets` prop:

```tsx
// New approach (recommended)
<BitteWalletContextProvider
  network="mainnet"
  wallets={["bitte"]}
  walletOptions={{
    bitte: { walletUrl: "https://wallet.bitte.ai" }
  }}
>
  <YourApp />
</BitteWalletContextProvider>
```

## Migration Guide

### From `onlyBitteWallet={true}`
```tsx
// Old
<BitteWalletContextProvider onlyBitteWallet={true} />

// New
<BitteWalletContextProvider wallets={["bitte"]} />
```

### From Default (All Wallets)
```tsx
// Old
<BitteWalletContextProvider network="mainnet" />

// New - specify exactly which wallets you want
<BitteWalletContextProvider 
  network="mainnet"
  wallets={["meteor", "mynear", "here", "intear", "okx", "hot"]}
/>
```

### With Additional Wallets
```tsx
// Old
<BitteWalletContextProvider 
  additionalWallets={[customWallet()]}
/>

// New - use the wallets prop and include custom wallets separately if needed
<BitteWalletContextProvider 
  wallets={["bitte", "meteor", "okx"]}
  additionalWallets={[customWallet()]} // Still supported
/>
```

## Error Handling

The system will throw an error if you specify an unsupported wallet type:

```tsx
// This will throw an error
<BitteWalletContextProvider 
  wallets={["bitte", "unsupported-wallet"]} // ❌ Error!
/>
```

## TypeScript Support

The package provides full TypeScript support with autocomplete for wallet types:

```tsx
import { SupportedWalletType } from "@bitte-ai/react";

const wallets: SupportedWalletType[] = ["bitte", "intear", "okx", "hot"]; // ✅ Autocomplete works
```

## Performance Considerations

- Only the wallets you specify will be loaded, reducing bundle size
- Each wallet adds approximately 50-150kb to your bundle
- Choose only the wallets your users actually need

## Testing

You can easily test different wallet configurations:

```tsx
// Test with single wallet
const testWallets = process.env.NODE_ENV === 'test' 
  ? ["bitte"] 
  : ["bitte", "meteor", "intear", "okx", "hot"];

<BitteWalletContextProvider wallets={testWallets} />
```
