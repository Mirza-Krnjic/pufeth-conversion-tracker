import { ethers } from 'ethers';

let provider: ethers.JsonRpcProvider | null = null;
let pufferVault: ethers.Contract | null = null;

export const getProvider = () => {
  if (!provider) {
    if (!process.env.ETHEREUM_RPC_URL) {
      throw new Error('ETHEREUM_RPC_URL environment variable is not set');
    }
    provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
  }
  return provider;
};

export const setProvider = (newProvider: ethers.JsonRpcProvider) => {
  provider = newProvider;
};

export const getPufferVault = () => {
  if (!pufferVault) {
    if (!process.env.PUFFER_VAULT_ADDRESS) {
      throw new Error('PUFFER_VAULT_ADDRESS environment variable is not set');
    }
    try {
      pufferVault = new ethers.Contract(
        process.env.PUFFER_VAULT_ADDRESS,
        [
          'function totalAssets() external view returns (uint256)',
          'function totalSupply() external view returns (uint256)',
        ],
        getProvider()
      );
    } catch (error) {
      console.error('Error creating PufferVault contract:', error);
      throw error;
    }
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
    console.log('Fetching conversion rate from contract:', process.env.PUFFER_VAULT_ADDRESS);
    
    const [totalAssets, totalSupply] = await Promise.all([
      vault.totalAssets(),
      vault.totalSupply(),
    ]);

    console.log('Total Assets:', totalAssets.toString());
    console.log('Total Supply:', totalSupply.toString());

    if (totalSupply === BigInt(0)) {
      throw new Error('Total supply cannot be zero');
    }

    const rate = Number(totalAssets) / Number(totalSupply);
    console.log('Calculated rate:', rate);
    return rate;
  } catch (error) {
    console.error('Error calculating conversion rate:', error);
    throw error;
  }
} 