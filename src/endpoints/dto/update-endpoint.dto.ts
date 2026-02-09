import { PartialType } from '@nestjs/mapped-types';
import { CreateEndpointDto } from './create-endpoint.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateEndpointDto extends PartialType(CreateEndpointDto) {
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
