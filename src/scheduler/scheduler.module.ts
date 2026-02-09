import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { HealthCheckService } from './health-check.service';
import { EndpointsModule } from '../endpoints/endpoints.module';
import { HealthLogsModule } from '../health-logs/health-logs.module';
import { AlertsModule } from '../alerts/alerts.module';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        EndpointsModule,
        HealthLogsModule,
        AlertsModule,
    ],
    providers: [HealthCheckService],
    exports: [HealthCheckService],
})
export class SchedulerModule { }
