// Fallback JSX types to avoid build failures in CI environments
// Prefer @types/react for full type safety
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any
  }
}

interface ImportMeta {
  env: Record<string, any>
}

