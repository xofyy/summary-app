import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';

@Injectable()
export class DatabaseConnectionService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseConnectionService.name);
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 5000; // 5 seconds

  constructor(
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async onModuleInit() {
    this.setupConnectionEvents();
    await this.checkConnection();
  }

  private setupConnectionEvents() {
    this.connection.on('connected', () => {
      this.logger.log('MongoDB connected successfully');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.connection.on('disconnected', () => {
      this.logger.warn('MongoDB disconnected');
      this.isConnected = false;
      this.handleReconnection();
    });

    this.connection.on('error', (error) => {
      this.logger.error('MongoDB connection error:', error);
      this.isConnected = false;
    });

    this.connection.on('reconnected', () => {
      this.logger.log('MongoDB reconnected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });
  }

  private async handleReconnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.logger.error(`Maximum reconnection attempts (${this.maxReconnectAttempts}) reached`);
      return;
    }

    this.reconnectAttempts++;
    this.logger.log(`Attempting to reconnect to MongoDB (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(async () => {
      try {
        await this.checkConnection();
      } catch (error) {
        this.logger.error('Reconnection attempt failed:', error);
      }
    }, this.reconnectDelay * this.reconnectAttempts); // Exponential backoff
  }

  async checkConnection(): Promise<boolean> {
    try {
      if (this.connection.readyState === 1) {
        this.isConnected = true;
        return true;
      } else {
        this.isConnected = false;
        return false;
      }
    } catch (error) {
      this.logger.error('Error checking database connection:', error);
      this.isConnected = false;
      return false;
    }
  }

  getConnectionStatus(): {
    isConnected: boolean;
    readyState: number;
    readyStateText: string;
    host?: string;
    name?: string;
  } {
    const readyStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    return {
      isConnected: this.isConnected,
      readyState: this.connection.readyState,
      readyStateText: readyStates[this.connection.readyState] || 'unknown',
      host: this.connection.host,
      name: this.connection.name,
    };
  }

  async executeWithFallback<T>(
    operation: () => Promise<T>,
    fallbackValue: T,
    operationName = 'Database operation'
  ): Promise<T> {
    try {
      if (!this.isConnected) {
        this.logger.warn(`${operationName} attempted while disconnected, using fallback`);
        return fallbackValue;
      }

      return await operation();
    } catch (error) {
      this.logger.error(`${operationName} failed:`, error);
      
      // Check if it's a connection error
      if (error.name === 'MongoNetworkError' || 
          error.name === 'MongoServerSelectionError' ||
          error.message?.includes('connection')) {
        this.isConnected = false;
        this.handleReconnection();
      }

      return fallbackValue;
    }
  }

  async waitForConnection(timeoutMs = 10000): Promise<boolean> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      if (await this.checkConnection()) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    this.logger.warn(`Database connection timeout after ${timeoutMs}ms`);
    return false;
  }
}