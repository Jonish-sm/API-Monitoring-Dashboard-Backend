import { Injectable, Inject } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, desc, and } from 'drizzle-orm';
import * as schema from '../../drizzle/schema';
import { DATABASE_CONNECTION } from '../database/database.module';

interface CreateAlertInput {
    endpointId: string;
    alertType: 'DOWN' | 'SLOW' | 'ERROR';
    message: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

@Injectable()
export class AlertsService {
    constructor(
        @Inject(DATABASE_CONNECTION)
        private readonly db: PostgresJsDatabase<typeof schema>,
    ) { }

    async create(input: CreateAlertInput) {
        const [alert] = await this.db
            .insert(schema.alerts)
            .values({
                endpointId: input.endpointId,
                alertType: input.alertType,
                message: input.message,
                severity: input.severity,
            })
            .returning();

        return alert;
    }

    async findAll(acknowledged?: boolean, limit = 100, offset = 0) {
        if (acknowledged !== undefined) {
            return this.db
                .select()
                .from(schema.alerts)
                .where(eq(schema.alerts.isAcknowledged, acknowledged))
                .orderBy(desc(schema.alerts.createdAt))
                .limit(limit)
                .offset(offset);
        }

        return this.db
            .select()
            .from(schema.alerts)
            .orderBy(desc(schema.alerts.createdAt))
            .limit(limit);
    }

    async findByEndpoint(endpointId: string, limit = 50) {
        return this.db
            .select()
            .from(schema.alerts)
            .where(eq(schema.alerts.endpointId, endpointId))
            .orderBy(desc(schema.alerts.createdAt))
            .limit(limit);
    }

    async acknowledge(id: string) {
        const [alert] = await this.db
            .update(schema.alerts)
            .set({
                isAcknowledged: true,
                acknowledgedAt: new Date(),
            })
            .where(eq(schema.alerts.id, id))
            .returning();

        return alert;
    }

    async checkAndCreateAlert(
        endpoint: schema.Endpoint,
        healthLog: schema.HealthLog,
    ): Promise<schema.Alert | null> {
        // Only create alerts for failures
        if (healthLog.success) {
            return null;
        }

        // Check if there's already a recent unacknowledged alert for this endpoint
        const recentAlerts = await this.db
            .select()
            .from(schema.alerts)
            .where(
                and(
                    eq(schema.alerts.endpointId, endpoint.id),
                    eq(schema.alerts.isAcknowledged, false),
                ),
            )
            .orderBy(desc(schema.alerts.createdAt))
            .limit(1);

        // Don't create duplicate alerts
        if (recentAlerts.length > 0) {
            const lastAlert = recentAlerts[0];
            const timeSinceLastAlert = Date.now() - lastAlert.createdAt.getTime();

            // Only create new alert if last one was more than 5 minutes ago
            if (timeSinceLastAlert < 5 * 60 * 1000) {
                return null;
            }
        }

        // Determine alert type and severity
        let alertType: 'DOWN' | 'SLOW' | 'ERROR' = 'ERROR';
        let severity: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';
        let message = `Endpoint ${endpoint.name} health check failed`;

        if (!healthLog.statusCode) {
            alertType = 'DOWN';
            severity = 'HIGH';
            message = `Endpoint ${endpoint.name} is unreachable: ${healthLog.errorMessage || 'Unknown error'}`;
        } else if (healthLog.statusCode !== endpoint.expectedStatus) {
            alertType = 'ERROR';
            severity = 'HIGH';
            message = `Endpoint ${endpoint.name} returned unexpected status ${healthLog.statusCode} (expected ${endpoint.expectedStatus})`;
        } else if (healthLog.responseTimeMs && healthLog.responseTimeMs > 5000) {
            alertType = 'SLOW';
            severity = 'MEDIUM';
            message = `Endpoint ${endpoint.name} is responding slowly (${healthLog.responseTimeMs}ms)`;
        }

        return this.create({
            endpointId: endpoint.id,
            alertType,
            message,
            severity,
        });
    }
}
