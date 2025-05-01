import { PufferVaultService } from '../contracts/pufferVault.service';
import { InfluxDBService } from '../services/influxdb.service';
import { ConversionRate } from '../contracts/pufferVault.interface';

export class RateTrackerService {
  private pufferVaultService: PufferVaultService;
  private influxDBService: InfluxDBService;
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(
    pufferVaultService: PufferVaultService,
    influxDBService: InfluxDBService
  ) {
    this.pufferVaultService = pufferVaultService;
    this.influxDBService = influxDBService;
  }

  // Start tracking rates
  async startTracking(intervalMs: number = 60000): Promise<void> {
    if (this.isRunning) {
      throw new Error('Rate tracking is already running');
    }

    this.isRunning = true;
    
    // Initial fetch
    await this.fetchAndStoreRate();

    // Set up periodic fetching
    this.intervalId = setInterval(
      () => this.fetchAndStoreRate(),
      intervalMs
    );
  }

  // Stop tracking rates
  stopTracking(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  // Fetch current rate and store it
  private async fetchAndStoreRate(): Promise<void> {
    try {
      // Get current rate from contract
      const rate: ConversionRate = await this.pufferVaultService.getCurrentRate();

      // Store in InfluxDB
      await this.influxDBService.storeConversionRate({
        timestamp: rate.timestamp,
        rate: rate.rate,
        totalAssets: rate.totalAssets,
        totalSupply: rate.totalSupply
      });

      console.log(`Rate tracked at ${rate.timestamp}: ${rate.rate}`);
    } catch (error: any) {
      console.error('Error tracking rate:', error?.message || 'Unknown error');
      // Here we could implement retry logic or alerting
    }
  }

  // Check if tracking is running
  isTracking(): boolean {
    return this.isRunning;
  }
} 