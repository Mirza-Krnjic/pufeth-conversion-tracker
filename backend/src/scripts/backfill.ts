import { ethers } from 'ethers';
import { config } from '../config';
import { writeConversionRate } from '../services/database3';

const VAULT_ABI = [
  'function totalAssets() view returns (uint256)',
  'function totalSupply() view returns (uint256)'
];

async function getHistoricalRate(timestamp: number): Promise<number> {
  const provider = new ethers.JsonRpcProvider(config.ethereum.rpcUrl);
  const vault = new ethers.Contract(config.ethereum.pufferVaultAddress, VAULT_ABI, provider);
  
  // Get the block number closest to the timestamp
  const currentBlock = await provider.getBlockNumber();
  const targetBlock = await findBlockNearTimestamp(provider, timestamp, currentBlock);
  
  // Get the rate at that block
  const [totalAssets, totalSupply] = await Promise.all([
    vault.totalAssets({ blockTag: targetBlock }),
    vault.totalSupply({ blockTag: targetBlock })
  ]);

  if (totalSupply === BigInt(0)) {
    throw new Error('Total supply cannot be zero');
  }

  return Number(totalAssets) / Number(totalSupply);
}

async function findBlockNearTimestamp(provider: ethers.JsonRpcProvider, timestamp: number, currentBlock: number): Promise<number> {
  // Binary search to find the block closest to the timestamp
  let left = 0;
  let right = currentBlock;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const block = await provider.getBlock(mid);
    
    if (!block) {
      throw new Error(`Block ${mid} not found`);
    }
    
    if (block.timestamp === timestamp) {
      return mid;
    }
    
    if (block.timestamp < timestamp) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  // Return the closest block
  const leftBlock = await provider.getBlock(left);
  const rightBlock = await provider.getBlock(right);
  
  if (!leftBlock || !rightBlock) {
    throw new Error('Could not find suitable block');
  }
  
  return Math.abs(leftBlock.timestamp - timestamp) < Math.abs(rightBlock.timestamp - timestamp) 
    ? left 
    : right;
}

async function backfillData() {
  console.log('Starting data backfill...');
  
  const now = Math.floor(Date.now() / 1000);
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60);
  
  // Get data points for each day
  for (let timestamp = thirtyDaysAgo; timestamp <= now; timestamp += 24 * 60 * 60) {
    try {
      console.log(`Getting rate for ${new Date(timestamp * 1000).toISOString()}`);
      const rate = await getHistoricalRate(timestamp);
      console.log(`Rate: ${rate}`);
      
      // Write to InfluxDB with the correct timestamp
      await writeConversionRate(rate);
      console.log(`Successfully wrote rate for ${new Date(timestamp * 1000).toISOString()}`);
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error processing timestamp ${timestamp}:`, error);
    }
  }
  
  console.log('Backfill complete!');
}

// Run the backfill
backfillData().catch(console.error); 