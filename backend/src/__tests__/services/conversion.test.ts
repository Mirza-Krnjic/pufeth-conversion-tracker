import { ethers } from 'ethers';
import { Contract } from 'ethers';

// Mock ethers
jest.mock('ethers', () => ({
  ...jest.requireActual('ethers'),
  Contract: jest.fn().mockImplementation(() => ({
    totalAssets: jest.fn().mockResolvedValue(ethers.utils.parseEther('100')),
    totalSupply: jest.fn().mockResolvedValue(ethers.utils.parseEther('50')),
  })),
  providers: {
    JsonRpcProvider: jest.fn().mockImplementation(() => ({})),
  },
  utils: {
    formatEther: jest.requireActual('ethers').utils.formatEther,
  },
}));

describe('Conversion Rate Calculation', () => {
  let pufferVault: Contract;

  beforeEach(() => {
    pufferVault = new Contract('0x...', [], new ethers.providers.JsonRpcProvider());
  });

  it('should calculate conversion rate correctly', async () => {
    const totalAssets = await pufferVault.totalAssets();
    const totalSupply = await pufferVault.totalSupply();
    
    const rate = Number(ethers.utils.formatEther(totalAssets)) / Number(ethers.utils.formatEther(totalSupply));
    
    expect(rate).toBe(2); // 100 / 50 = 2
  });

  it('should handle zero total supply', async () => {
    pufferVault.totalSupply.mockResolvedValueOnce(ethers.utils.parseEther('0'));
    
    const totalAssets = await pufferVault.totalAssets();
    const totalSupply = await pufferVault.totalSupply();
    
    const rate = Number(ethers.utils.formatEther(totalAssets)) / Number(ethers.utils.formatEther(totalSupply));
    
    expect(rate).toBe(Infinity);
  });

  it('should handle contract errors', async () => {
    pufferVault.totalAssets.mockRejectedValueOnce(new Error('Contract call failed'));
    
    await expect(pufferVault.totalAssets()).rejects.toThrow('Contract call failed');
  });
}); 