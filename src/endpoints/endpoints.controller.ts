import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    ValidationPipe,
    UsePipes,
} from '@nestjs/common';
import { EndpointsService } from './endpoints.service';
import { CreateEndpointDto } from './dto/create-endpoint.dto';
import { UpdateEndpointDto } from './dto/update-endpoint.dto';

@Controller('endpoints')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class EndpointsController {
    constructor(private readonly endpointsService: EndpointsService) { }

    @Post()
    create(@Body() createEndpointDto: CreateEndpointDto) {
        return this.endpointsService.create(createEndpointDto);
    }

    @Get()
    findAll() {
        return this.endpointsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.endpointsService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateEndpointDto: UpdateEndpointDto) {
        return this.endpointsService.update(id, updateEndpointDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.endpointsService.remove(id);
    }
}
