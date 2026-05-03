/**
 * Ambient shim so TypeScript accepts dynamic/manual imports of the optional
 * `@0gfoundation/0g-storage-ts-sdk` package (not listed in root package.json).
 * See docs/zerog-storage-sdk-peer.md.
 */
declare module "@0gfoundation/0g-storage-ts-sdk" {
  export class Indexer {
    constructor(indexerUrl: string);
    upload(...args: unknown[]): Promise<unknown>;
    download(...args: unknown[]): Promise<unknown>;
  }

  export namespace ZgFile {
    export function fromFilePath(filePath: string): Promise<{
      merkleTree(): Promise<[unknown, unknown]>;
      close?: () => Promise<void>;
    }>;
  }
}
