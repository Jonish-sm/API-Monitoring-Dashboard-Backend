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
    Query,
    ParseIntPipe,
} from '@nestjs/common';
import { EndpointsService } from './endpoints.service';
import { CreateEndpointDto } from './dto/create-endpoint.dto';
import { UpdateEndpointDto } from './dto/update-endpoint.dto';

@Controller('endpoints')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class EndpointsController {
  constructor(private readonly endpointsService: EndpointsService) {}

  @Post()
  create(@Body() createEndpointDto: CreateEndpointDto) {
    return this.endpointsService.create(createEndpointDto);
  }

  @Get()
  findAll(
    @Query('endpointName') endpointName?: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
  ) {
    return this.endpointsService.findAll(limit, offset, endpointName);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.endpointsService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateEndpointDto: UpdateEndpointDto,
  ) {
    return this.endpointsService.update(id, updateEndpointDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.endpointsService.remove(id);
  }
}
