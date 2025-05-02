import { ethers } from 'ethers';

let provider: ethers.JsonRpcProvider | null = null;
let pufferVault: ethers.Contract | null = null;

export const getProvider = () => {
  if (!provider) {
    provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
  }
  return provider;
};

export const setProvider = (newProvider: ethers.JsonRpcProvider) => {
  provider = newProvider;
};

export const getPufferVault = () => {
  if (!pufferVault) {
    pufferVault = new ethers.Contract(
      process.env.PUFFER_VAULT_ADDRESS || '',
      [
        'function totalAssets() external view returns (uint256)',
        'function totalSupply() external view returns (uint256)',
      ],
      getProvider()
    );
  }
  return pufferVault;
};

export const setPufferVault = (newVault: ethers.Contract) => {
  pufferVault = newVault;
};

export const resetConversionService = () => {
  provider = null;
  pufferVault = null;
};

export async function calculateConversionRate(): Promise<number> {
  try {
    const vault = getPufferVault();
    const [totalAssets, totalSupply] = await Promise.all([
      vault.totalAssets(),
      vault.totalSupply(),
    ]);

    if (totalSupply === BigInt(0)) {
      throw new Error('Total supply cannot be zero');
    }

    return Number(ethers.formatEther(totalAssets)) / Number(ethers.formatEther(totalSupply));
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to calculate conversion rate');
  }
} 