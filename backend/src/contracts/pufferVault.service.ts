import { ethers } from 'ethers';
import { 
  PUFFER_VAULT_ABI, 
  PUFFER_VAULT_ADDRESS, 
  PufferVaultContract,
  ConversionRate 
} from './pufferVault.interface';

export class PufferVaultService {
  private provider: ethers.providers.JsonRpcProvider;
  private contract: PufferVaultContract;

  constructor() {
    // Initialize provider with environment variable or default to public RPC
    this.provider = new ethers.providers.JsonRpcProvider(
      process.env.ETHEREUM_RPC_URL || 'https://eth.llamarpc.com'
    );

    // Initialize contract
    this.contract = new ethers.Contract(
      PUFFER_VAULT_ADDRESS,
      PUFFER_VAULT_ABI,
      this.provider
    ) as unknown as PufferVaultContract;
  }

  // Get current conversion rate
  async getCurrentRate(): Promise<ConversionRate> {
    try {
      const [totalAssets, totalSupply] = await Promise.all([
        this.contract.totalAssets(),
        this.contract.totalSupply()
      ]);

      // Convert both values to ether (18 decimals)
      const assetsInEther = ethers.utils.formatEther(totalAssets);
      const supplyInEther = ethers.utils.formatEther(totalSupply);
      
      // Calculate rate (assets / supply)
      const rate = parseFloat(assetsInEther) / parseFloat(supplyInEther);

      return {
        rate,
        totalAssets: totalAssets.toString(),
        totalSupply: totalSupply.toString(),
        timestamp: new Date()
      };
    } catch (error: any) {
      throw new Error(`Failed to get conversion rate: ${error?.message || 'Unknown error'}`);
    }
  }

  // Get provider for external use
  getProvider(): ethers.providers.JsonRpcProvider {
    return this.provider;
  }

  // Get contract instance for external use
  getContract(): PufferVaultContract {
    return this.contract;
  }
} 