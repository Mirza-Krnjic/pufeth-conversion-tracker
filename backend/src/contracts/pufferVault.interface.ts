import { ethers } from 'ethers';

// PufferVaultV2 contract ABI - only the functions we need
export const PUFFER_VAULT_ABI = [
  'function totalAssets() view returns (uint256)',
  'function totalSupply() view returns (uint256)'
];

// Contract address
export const PUFFER_VAULT_ADDRESS = '0xD9A442856C234a39a81a089C06451EBAa4306a72';

// Interface for contract interaction
export interface PufferVaultContract {
  totalAssets(): Promise<ethers.BigNumber>;
  totalSupply(): Promise<ethers.BigNumber>;
}

// Type for conversion rate calculation
export interface ConversionRate {
  rate: number;
  totalAssets: string;
  totalSupply: string;
  timestamp: Date;
} 