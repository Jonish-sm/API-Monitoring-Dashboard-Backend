import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import { EndpointsService } from '../endpoints/endpoints.service';
import { HealthLogsService } from '../health-logs/health-logs.service';
import { AlertsService } from '../alerts/alerts.service';

@Injectable()
export class HealthCheckService {
    private readonly logger = new Logger(HealthCheckService.name);

    constructor(
        private readonly endpointsService: EndpointsService,
        private readonly healthLogsService: HealthLogsService,
        private readonly alertsService: AlertsService,
        private readonly configService: ConfigService,
    ) { }

    // Run every 5 minutes by default (can be configured via CRON_SCHEDULE env variable)
    @Cron(process.env.CRON_SCHEDULE || '*/5 * * * *')
    async handleHealthChecks() {
        this.logger.log('Starting health check cycle...');

        try {
            const activeEndpoints = await this.endpointsService.findActive();

            if (activeEndpoints.length === 0) {
                this.logger.log('No active endpoints to check');
                return;
            }

            this.logger.log(`Checking ${activeEndpoints.length} active endpoints`);

            // Check all endpoints in parallel
            const checkPromises = activeEndpoints.map((endpoint) =>
                this.checkEndpoint(endpoint),
            );

            await Promise.allSettled(checkPromises);

            this.logger.log('Health check cycle completed');
        } catch (error) {
            this.logger.error('Error during health check cycle:', error);
        }
    }

    private async checkEndpoint(endpoint: any) {
        const startTime = Date.now();

        try {
            this.logger.debug(`Checking endpoint: ${endpoint.name} (${endpoint.url})`);

            const response = await axios({
                method: endpoint.method || 'GET',
                url: endpoint.url,
                headers: endpoint.headers || {},
                timeout: 30000, // 30 seconds timeout
                validateStatus: () => true, // Don't throw on any status code
            });

            const responseTime = Date.now() - startTime;
            const success = response.status === endpoint.expectedStatus;

            // Log the health check result
            const healthLog = await this.healthLogsService.create({
                endpointId: endpoint.id,
                statusCode: response.status,
                responseTimeMs: responseTime,
                success,
                errorMessage: success ? undefined : `Status code mismatch: got ${response.status}, expected ${endpoint.expectedStatus}`,
            });

            this.logger.debug(
                `Endpoint ${endpoint.name}: ${success ? 'SUCCESS' : 'FAILED'} (${responseTime}ms, status: ${response.status})`,
            );

            // Check if we need to create an alert
            if (!success) {
                const alert = await this.alertsService.checkAndCreateAlert(endpoint, healthLog);
                if (alert) {
                    this.logger.warn(`Alert created for endpoint ${endpoint.name}: ${alert.message}`);
                }
            }
        } catch (error) {
            const responseTime = Date.now() - startTime;
            const errorMessage = error instanceof AxiosError
                ? error.message
                : 'Unknown error occurred';

            // Log the failure
            const healthLog = await this.healthLogsService.create({
                endpointId: endpoint.id,
                statusCode: undefined,
                responseTimeMs: responseTime,
                success: false,
                errorMessage,
            });

            this.logger.error(`Endpoint ${endpoint.name} check failed: ${errorMessage}`);

            // Create alert for the failure
            const alert = await this.alertsService.checkAndCreateAlert(endpoint, healthLog);
            if (alert) {
                this.logger.warn(`Alert created for endpoint ${endpoint.name}: ${alert.message}`);
            }
        }
    }

    // Manual trigger endpoint for testing (can be called via a controller if needed)
    async triggerManualCheck(endpointId?: string) {
        if (endpointId) {
            const endpoint = await this.endpointsService.findOne(endpointId);
            await this.checkEndpoint(endpoint);
        } else {
            await this.handleHealthChecks();
        }
    }
}
