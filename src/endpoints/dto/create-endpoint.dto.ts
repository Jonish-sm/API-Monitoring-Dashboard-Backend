import {
    IsString,
    IsUrl,
    IsOptional,
    IsEnum,
    IsNumber,
    Min,
    Max,
    IsObject,
    MinLength,
} from 'class-validator';

export class CreateEndpointDto {
    @IsString()
    @MinLength(1)
    name: string;

    @IsUrl()
    url: string;

    @IsOptional()
    @IsEnum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'])
    method?: string;

    @IsOptional()
    @IsObject()
    headers?: Record<string, string>;

    @IsOptional()
    @IsNumber()
    @Min(100)
    @Max(599)
    expectedStatus?: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    checkInterval?: number;
}
