import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Enable React Compiler for automatic component memoization
  reactCompiler: true,
  output: 'export',
  distDir: '.next',
};

export default nextConfig;
