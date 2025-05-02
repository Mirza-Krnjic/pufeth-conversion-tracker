import { ethers } from 'ethers';
import {
  calculateConversionRate,
  getPufferVault,
  resetConversionService,
  setProvider,
  setPufferVault,
} from '../../services/conversion';

// Mock ethers
const mockContract = {
  totalAssets: jest.fn(),
  totalSupply: jest.fn(),
};

const mockProvider = {
  getNetwork: jest.fn().mockResolvedValue({ chainId: 1 }),
};

jest.mock('ethers', () => {
  const actualEthers = jest.requireActual('ethers');
  return {
    ...actualEthers,
    Contract: jest.fn().mockImplementation(() => mockContract),
    JsonRpcProvider: jest.fn().mockImplementation(() => mockProvider),
  };
});

describe('Conversion Service', () => {
  beforeEach(() => {
    resetConversionService();
    setProvider(mockProvider as unknown as ethers.JsonRpcProvider);
    setPufferVault(mockContract as unknown as ethers.Contract);
    // Use BigInt for ethers v6 compatibility
    mockContract.totalAssets.mockResolvedValue(BigInt('100000000000000000000')); // 100 ETH
    mockContract.totalSupply.mockResolvedValue(BigInt('50000000000000000000')); // 50 ETH
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should calculate conversion rate correctly', async () => {
    const rate = await calculateConversionRate();
    expect(rate).toBe(2); // 100 / 50 = 2
  });

  it('should handle zero total supply', async () => {
    mockContract.totalSupply.mockResolvedValueOnce(BigInt(0));
    
    await expect(calculateConversionRate()).rejects.toThrow('Total supply cannot be zero');
  });

  it('should handle contract errors', async () => {
    mockContract.totalAssets.mockRejectedValueOnce(new Error('Contract call failed'));
    
    await expect(calculateConversionRate()).rejects.toThrow('Contract call failed');
  });

  it('should reuse the same contract instance', async () => {
    const vault1 = getPufferVault();
    const vault2 = getPufferVault();
    expect(vault1).toBe(vault2);
  });

  it('should create a new contract instance after reset', async () => {
    const vault1 = getPufferVault();
    resetConversionService();
    const vault2 = getPufferVault();
    expect(vault1).not.toBe(vault2);
  });
}); 