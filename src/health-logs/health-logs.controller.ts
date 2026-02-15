import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { HealthLogsService } from './health-logs.service';

@Controller('health-logs')
export class HealthLogsController {
    constructor(private readonly healthLogsService: HealthLogsService) { }

    @Get()
    findAll(
        @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
        @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
    ) {
        return this.healthLogsService.findAll(limit, offset);
    }

    @Get('endpoint/:endpointId')
    findByEndpoint(
        @Param('endpointId') endpointId: string,
        @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
        @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
    ) {
        return this.healthLogsService.findByEndpoint(endpointId, limit, offset);
    }

    @Get('analytics/:endpointId')
    getAnalytics(
        @Param('endpointId') endpointId: string,
        @Query('hours', new ParseIntPipe({ optional: true })) hours?: number,
    ) {
        return this.healthLogsService.getAnalytics(endpointId, hours);
    }
}
