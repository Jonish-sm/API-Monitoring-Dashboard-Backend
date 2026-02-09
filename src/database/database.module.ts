import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres = require('postgres');
import * as schema from '../../drizzle/schema';

export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';

@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: DATABASE_CONNECTION,
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => {
                const connectionString = configService.get<string>('DATABASE_URL');

                if (!connectionString) {
                    throw new Error('DATABASE_URL is not defined in environment variables');
                }

                const client = postgres(connectionString);
                return drizzle(client, { schema });
            },
        },
    ],
    exports: [DATABASE_CONNECTION],
})
export class DatabaseModule { }
