import { Injectable, Inject } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, desc, sql, and, gte } from 'drizzle-orm';
import * as schema from '../../drizzle/schema';
import { DATABASE_CONNECTION } from '../database/database.module';
import { CreateHealthLogDto } from './dto/create-health-log.dto';

@Injectable()
export class HealthLogsService {
    constructor(
        @Inject(DATABASE_CONNECTION)
        private readonly db: PostgresJsDatabase<typeof schema>,
    ) { }

    async create(createHealthLogDto: CreateHealthLogDto) {
        const [log] = await this.db
            .insert(schema.healthLogs)
            .values({
                endpointId: createHealthLogDto.endpointId,
                statusCode: createHealthLogDto.statusCode,
                responseTimeMs: createHealthLogDto.responseTimeMs,
                success: createHealthLogDto.success,
                errorMessage: createHealthLogDto.errorMessage,
            })
            .returning();

        return log;
    }

    async findAll(limit = 100, offset = 0) {
        return this.db
            .select()
            .from(schema.healthLogs)
            .orderBy(desc(schema.healthLogs.checkedAt))
            .limit(limit)
            .offset(offset);
    }

    async findByEndpoint(endpointId: string, limit = 50, offset = 0) {
        return this.db
            .select()
            .from(schema.healthLogs)
            .where(eq(schema.healthLogs.endpointId, endpointId))
            .orderBy(desc(schema.healthLogs.checkedAt))
            .limit(limit)
            .offset(offset);
    }

    async getAnalytics(endpointId: string, hoursBack = 24) {
        const timeThreshold = new Date();
        timeThreshold.setHours(timeThreshold.getHours() - hoursBack);

        const logs = await this.db
            .select()
            .from(schema.healthLogs)
            .where(
                and(
                    eq(schema.healthLogs.endpointId, endpointId),
                    gte(schema.healthLogs.checkedAt, timeThreshold),
                ),
            );

        if (logs.length === 0) {
            return {
                totalChecks: 0,
                successfulChecks: 0,
                failedChecks: 0,
                uptimePercentage: 0,
                averageResponseTime: 0,
                lastCheckStatus: null,
            };
        }

        const successfulChecks = logs.filter((log) => log.success).length;
        const failedChecks = logs.length - successfulChecks;
        const uptimePercentage = (successfulChecks / logs.length) * 100;

        const responseTimes = logs
            .filter((log) => log.responseTimeMs !== null)
            .map((log) => log.responseTimeMs!);

        const averageResponseTime =
            responseTimes.length > 0
                ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
                : 0;

        return {
            totalChecks: logs.length,
            successfulChecks,
            failedChecks,
            uptimePercentage: Math.round(uptimePercentage * 100) / 100,
            averageResponseTime: Math.round(averageResponseTime),
            lastCheckStatus: logs[0]?.success ? 'UP' : 'DOWN',
            timeRange: `Last ${hoursBack} hours`,
        };
    }
}
