import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  BadRequestException,
  HttpException,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { LoggerService } from '../../services/logger.service';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly logger: LoggerService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createProductDto: CreateProductDto) {
    try {
      if (!createProductDto.name || !createProductDto.category) {
        throw new BadRequestException(
          'Los campos name y category son requeridos',
        );
      }

      const result = await this.productsService.create(createProductDto);
      this.logger.info('Controller: create', { id: result.id });
      return result;
    } catch (error) {
      this.logger.error('Controller: create error', { error: error instanceof Error ? error.message : String(error) });
      if (error instanceof HttpException) throw error;
      throw new HttpException({ statusCode: 500, error: 'Internal Server Error', message: 'Error interno en create', timestamp: new Date().toISOString() }, 500);
    }
  }

  @Get()
  async findAll() {
    try {
      const result = await this.productsService.findAll();
      this.logger.info('Controller: findAll', { count: result.length });
      return result;
    } catch (error) {
      this.logger.error('Controller: findAll error', { error: error instanceof Error ? error.message : String(error) });
      throw new HttpException({ statusCode: 500, error: 'Internal Server Error', message: 'Error interno en findAll', timestamp: new Date().toISOString() }, 500);
    }
  }

  @Get('stats')
  async getStats() {
    try {
      return await this.productsService.getStats();
    } catch (error) {
      this.logger.error('Controller: getStats error', { error: error instanceof Error ? error.message : String(error) });
      throw new HttpException({ statusCode: 500, error: 'Internal Server Error', message: 'Error interno en getStats', timestamp: new Date().toISOString() }, 500);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const parsedId = parseInt(id, 10);
      if (isNaN(parsedId)) {
        throw new BadRequestException('El ID debe ser un número válido');
      }
      const result = await this.productsService.findOne(parsedId);
      this.logger.info('Controller: findOne', { id: parsedId });
      return result;
    } catch (error) {
      this.logger.error('Controller: findOne error', { error: error instanceof Error ? error.message : String(error) });
      if (error instanceof HttpException) throw error;
      throw new HttpException({ statusCode: 500, error: 'Internal Server Error', message: 'Error interno en findOne', timestamp: new Date().toISOString() }, 500);
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    try {
      const parsedId = parseInt(id, 10);
      if (isNaN(parsedId)) {
        throw new BadRequestException('El ID debe ser un número válido');
      }
      const result = await this.productsService.update(parsedId, updateProductDto);
      this.logger.info('Controller: update', { id: parsedId });
      return result;
    } catch (error) {
      this.logger.error('Controller: update error', { error: error instanceof Error ? error.message : String(error) });
      if (error instanceof HttpException) throw error;
      throw new HttpException({ statusCode: 500, error: 'Internal Server Error', message: 'Error interno en update', timestamp: new Date().toISOString() }, 500);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const parsedId = parseInt(id, 10);
      if (isNaN(parsedId)) {
        throw new BadRequestException('El ID debe ser un número válido');
      }
      const result = await this.productsService.remove(parsedId);
      this.logger.info('Controller: remove', { id: parsedId });
      return result;
    } catch (error) {
      this.logger.error('Controller: remove error', { error: error instanceof Error ? error.message : String(error) });
      if (error instanceof HttpException) throw error;
      throw new HttpException({ statusCode: 500, error: 'Internal Server Error', message: 'Error interno en remove', timestamp: new Date().toISOString() }, 500);
    }
  }
}

