// Stub for @wagmi/core/tempo — this subpath only exists in wagmi v3.
// The project uses wagmi v2. @reown/appkit-adapter-wagmi bundles @wagmi/connectors@8.x
// which re-exports `tempoWallet` from this path, but we never use that connector.
// Both the webpack alias and Turbopack resolveAlias in next.config.js point here.

export function tempoWallet() {
  return null;
}
