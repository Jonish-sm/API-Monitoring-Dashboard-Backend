import { Module } from '@nestjs/common';
import { HealthLogsService } from './health-logs.service';
import { HealthLogsController } from './health-logs.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [HealthLogsController],
    providers: [HealthLogsService],
    exports: [HealthLogsService],
})
export class HealthLogsModule { }
