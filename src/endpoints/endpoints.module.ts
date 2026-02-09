import { Module } from '@nestjs/common';
import { EndpointsService } from './endpoints.service';
import { EndpointsController } from './endpoints.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [EndpointsController],
    providers: [EndpointsService],
    exports: [EndpointsService],
})
export class EndpointsModule { }
