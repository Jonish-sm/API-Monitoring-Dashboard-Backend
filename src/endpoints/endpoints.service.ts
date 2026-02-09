import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import * as schema from '../../drizzle/schema';
import { DATABASE_CONNECTION } from '../database/database.module';
import { CreateEndpointDto } from './dto/create-endpoint.dto';
import { UpdateEndpointDto } from './dto/update-endpoint.dto';

@Injectable()
export class EndpointsService {
    constructor(
        @Inject(DATABASE_CONNECTION)
        private readonly db: PostgresJsDatabase<typeof schema>,
    ) { }

    async create(createEndpointDto: CreateEndpointDto) {
        const [endpoint] = await this.db
            .insert(schema.endpoints)
            .values({
                name: createEndpointDto.name,
                url: createEndpointDto.url,
                method: createEndpointDto.method || 'GET',
                headers: createEndpointDto.headers,
                expectedStatus: createEndpointDto.expectedStatus || 200,
                checkInterval: createEndpointDto.checkInterval || 5,
            })
            .returning();

        return endpoint;
    }

    async findAll() {
        return this.db.select().from(schema.endpoints);
    }

    async findOne(id: string) {
        const [endpoint] = await this.db
            .select()
            .from(schema.endpoints)
            .where(eq(schema.endpoints.id, id));

        if (!endpoint) {
            throw new NotFoundException(`Endpoint with ID ${id} not found`);
        }

        return endpoint;
    }

    async findActive() {
        return this.db
            .select()
            .from(schema.endpoints)
            .where(eq(schema.endpoints.isActive, true));
    }

    async update(id: string, updateEndpointDto: UpdateEndpointDto) {
        const endpoint = await this.findOne(id);

        const [updated] = await this.db
            .update(schema.endpoints)
            .set({
                ...updateEndpointDto,
                updatedAt: new Date(),
            })
            .where(eq(schema.endpoints.id, id))
            .returning();

        return updated;
    }

    async remove(id: string) {
        const endpoint = await this.findOne(id);

        await this.db.delete(schema.endpoints).where(eq(schema.endpoints.id, id));

        return { message: `Endpoint ${id} deleted successfully` };
    }
}
