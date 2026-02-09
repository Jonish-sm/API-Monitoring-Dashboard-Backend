import {
    Controller,
    Get,
    Put,
    Param,
    Query,
    ParseBoolPipe,
    ParseIntPipe,
} from '@nestjs/common';
import { AlertsService } from './alerts.service';

@Controller('alerts')
export class AlertsController {
    constructor(private readonly alertsService: AlertsService) { }

    @Get()
    findAll(
        @Query('acknowledged', new ParseBoolPipe({ optional: true }))
        acknowledged?: boolean,
        @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    ) {
        return this.alertsService.findAll(acknowledged, limit);
    }

    @Get('endpoint/:endpointId')
    findByEndpoint(
        @Param('endpointId') endpointId: string,
        @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    ) {
        return this.alertsService.findByEndpoint(endpointId, limit);
    }

    @Put(':id/acknowledge')
    acknowledge(@Param('id') id: string) {
        return this.alertsService.acknowledge(id);
    }
}
