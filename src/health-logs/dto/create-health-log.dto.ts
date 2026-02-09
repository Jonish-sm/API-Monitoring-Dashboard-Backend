import { IsUUID, IsNumber, IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateHealthLogDto {
    @IsUUID()
    endpointId: string;

    @IsOptional()
    @IsNumber()
    statusCode?: number;

    @IsOptional()
    @IsNumber()
    responseTimeMs?: number;

    @IsBoolean()
    success: boolean;

    @IsOptional()
    @IsString()
    errorMessage?: string;
}
