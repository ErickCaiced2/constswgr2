import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.model';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { EventEmitterService } from '../../services/event-emitter.service';
import { LoggerService } from '../../services/logger.service';
import { ProductEntity } from './product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private productsRepository: Repository<ProductEntity>,
    private eventEmitter: EventEmitterService,
    private logger: LoggerService,
  ) {}

  private getAdaptiveMetadata() {
    return {
      source: 'cleaning-crud',
      system: 'Sistema de Gestión de Productos de Limpieza',
      apiVersion: 'v1',
      timestampISO: new Date().toISOString(),
      timezone: 'America/Guayaquil',
      environment: 'local',
      integrationTarget: 'EPN Event Manager',
    };
  }

  private isLogicalDeleteEnabled(): boolean {
    return process.env.LOGICAL_DELETE === 'true';
  }

async create(createProductDto: CreateProductDto): Promise<Product> {

   if (!createProductDto.name || createProductDto.name.trim() === '') {
     throw new BadRequestException('El nombre del producto es obligatorio');
   }

   if (!createProductDto.category || createProductDto.category.trim() === '') {
     throw new BadRequestException('La categoría del producto es obligatoria');
   }

   if (createProductDto.quantity < 0) {
     throw new BadRequestException('La cantidad no puede ser negativa');
   }

   if (createProductDto.price < 0) {
     throw new BadRequestException('El precio no puede ser negativo');
   }

   // Mantenimiento preventivo: limitar entradas y bloquear texto sospechoso
   const suspiciousPattern =
     /<script|<\/script>|SELECT|DROP|INSERT|DELETE|UPDATE|--/i;

   if (createProductDto.name.length > 100) {
     throw new BadRequestException(
       'El nombre no puede superar los 100 caracteres',
     );
   }

   if (createProductDto.category.length > 50) {
     throw new BadRequestException(
       'La categoría no puede superar los 50 caracteres',
     );
   }

   if (
     createProductDto.description &&
     createProductDto.description.length > 300
   ) {
     throw new BadRequestException(
       'La descripción no puede superar los 300 caracteres',
     );
   }

   if (
     suspiciousPattern.test(createProductDto.name) ||
     suspiciousPattern.test(createProductDto.category) ||
     suspiciousPattern.test(createProductDto.description || '')
   ) {
     throw new BadRequestException(
       'El producto contiene texto no permitido por seguridad',
     );
   }

    try {
    // [PREVENTIVE] Duplicate id check if client provides id (tests may use this)
    if (createProductDto['id'] !== undefined && createProductDto['id'] !== null) {
      const existing = await this.productsRepository.findOne({ where: { id: createProductDto['id'] } });
      if (existing) {
        throw new BadRequestException(`Producto con ID ${createProductDto['id']} ya existe`);
      }
    }

    // Crear y guardar en la base de datos
    const productEntity = this.productsRepository.create({
     name: createProductDto.name,
     category: createProductDto.category,
     quantity: createProductDto.quantity,
     price: createProductDto.price,
     description: createProductDto.description,
   });
    const savedProduct = await this.productsRepository.save(productEntity);
    const product = this.entityToModel(savedProduct);

    this.logger.info('Entity created', { id: product.id, name: product.name });

    await this.eventEmitter.emitEvent(
      'CREATE',
      'product',
      `Producto de limpieza creado: ${product.name}`,
      `Se agregó un nuevo producto de categoría "${product.category}" con ${product.quantity} unidades en inventario`,
      {
        id: product.id,
        name: product.name,
        category: product.category,
        quantity: product.quantity,
        price: product.price,
        metadata: this.getAdaptiveMetadata(),
      },
    );

    return product;
    } catch (error) {
      this.logger.error('Error in create', { error: error instanceof Error ? error.message : String(error) });
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Error interno creando producto');
    }
}

 async findAll(): Promise<Product[]> {
   try {
    const products = await this.productsRepository.find();
    // [PREVENTIVE] filter out logically deleted items if enabled
    const filtered = this.isLogicalDeleteEnabled() ? products.filter(p => !p['deleted']) : products;
    const models = filtered.map(p => this.entityToModel(p));

    this.logger.info('Find all products', { count: products.length });

    this.eventEmitter.emitEvent(
      'QUERY',
      'product',
      'Listado de productos consultado',
      `Se consultó el listado completo de ${products.length} productos`,
      {
        count: products.length,
        totalValue: products.reduce(
          (acc: number, p: any) => acc + parseFloat(p.price.toString()) * p.quantity,
          0,
        ),
        metadata: this.getAdaptiveMetadata(),
      },
    );

    return models;
   } catch (error) {
     this.logger.error('Error in findAll', { error: error instanceof Error ? error.message : String(error) });
     throw new InternalServerErrorException('Error interno consultando productos');
   }
 }

async findOne(id: number): Promise<Product> {
    try {
          const product = await this.productsRepository.findOne({ where: { id } });
          if (this.isLogicalDeleteEnabled() && product && product['deleted']) {
            throw new NotFoundException(`Producto con ID ${id} no encontrado en la base de datos`);
          }

      if (!product) {
        throw new NotFoundException(
          `Producto con ID ${id} no encontrado en la base de datos`,
        );
      }

      const model = this.entityToModel(product);
      this.logger.info('Entity fetched', { id: model.id, name: model.name });

      this.eventEmitter.emitEvent(
        'QUERY',
        'product',
        `Producto consultado: ${product.name}`,
        `Se consultó el producto con ID ${id}`,
        {
          id: product.id,
          name: product.name,
          category: product.category,
          metadata: this.getAdaptiveMetadata(),
        },
      );

      return model;
    } catch (error) {
      this.logger.error('Error in findOne', { error: error instanceof Error ? error.message : String(error) });
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error interno consultando producto');
    }
   }

 async update(
     id: number,
     updateProductDto: UpdateProductDto,
   ): Promise<Product> {
      try {
      const product = await this.productsRepository.findOne({ where: { id } });

      if (!product) {
        throw new NotFoundException(
          `Producto con ID ${id} no encontrado. No se puede actualizar.`,
        );
      }

      // [PREVENTIVE] validate inputs on update similar to create
      const suspiciousPattern = /<script|<\/script>|SELECT|DROP|INSERT|DELETE|UPDATE|--/i;

      if (updateProductDto.name !== undefined) {
        if (updateProductDto.name.trim() === '') {
          throw new BadRequestException('El nombre del producto es obligatorio');
        }
        if (updateProductDto.name.length > 100) throw new BadRequestException('El nombre no puede superar los 100 caracteres');
        if (suspiciousPattern.test(updateProductDto.name)) throw new BadRequestException('Campo nombre contiene texto no permitido');
      }

      if (updateProductDto.category !== undefined) {
        if (updateProductDto.category.trim() === '') {
          throw new BadRequestException('La categoría del producto es obligatoria');
        }
        if (updateProductDto.category.length > 50) throw new BadRequestException('La categoría no puede superar los 50 caracteres');
        if (suspiciousPattern.test(updateProductDto.category)) throw new BadRequestException('Campo categoría contiene texto no permitido');
      }

      if (updateProductDto.quantity !== undefined) {
        if (updateProductDto.quantity < 0) throw new BadRequestException('La cantidad no puede ser negativa');
      }

      if (updateProductDto.price !== undefined) {
        if (updateProductDto.price < 0) throw new BadRequestException('El precio no puede ser negativo');
      }

      const previousValues = {
        name: product.name,
        category: product.category,
        quantity: product.quantity,
        price: parseFloat(product.price.toString()),
        description: product.description,
      };

      if (updateProductDto.name !== undefined) {
        product.name = updateProductDto.name;
      }

      if (updateProductDto.category !== undefined) {
        product.category = updateProductDto.category;
      }

      if (updateProductDto.quantity !== undefined) {
        product.quantity = updateProductDto.quantity;
      }

      if (updateProductDto.price !== undefined) {
        product.price = updateProductDto.price;
      }

      if (updateProductDto.description !== undefined) {
        product.description = updateProductDto.description;
      }

      const updatedProduct = await this.productsRepository.save(product);
      const model = this.entityToModel(updatedProduct);

      this.logger.info('Entity updated', { id: model.id, name: model.name });

      await this.eventEmitter.emitEvent(
        'UPDATE',
        'product',
        `Producto actualizado: ${product.name}`,
        `Se actualizaron los datos del producto con ID ${id}`,
        {
          id: product.id,
          name: product.name,
          previousValues,
          newValues: updateProductDto,
          metadata: this.getAdaptiveMetadata(),
        },
      );

      return model;
      } catch (error) {
        this.logger.error('Error in update', { error: error instanceof Error ? error.message : String(error) });
        if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
        throw new InternalServerErrorException('Error interno actualizando producto');
      }
   }

async remove(id: number): Promise<Product> {
      try {
      const product = await this.productsRepository.findOne({ where: { id } });

      if (!product) {
        throw new NotFoundException(
          `Producto con ID ${id} no encontrado. No se puede eliminar.`,
        );
      }

      const model = this.entityToModel(product);
      if (this.isLogicalDeleteEnabled()) {
        // perform logical deletion
        product['deleted'] = true;
        await this.productsRepository.save(product);
        this.logger.info('Entity logically deleted', { id: model.id, name: model.name });
      } else {
        await this.productsRepository.remove(product);
        this.logger.info('Entity deleted', { id: model.id, name: model.name });
      }

      await this.eventEmitter.emitEvent(
        'DELETE',
        'product',
        `Producto eliminado: ${product.name}`,
        `Se eliminó el producto con ID ${id} de la base de datos`,
        {
          id: product.id,
          name: product.name,
          category: product.category,
          quantity: product.quantity,
          price: parseFloat(product.price.toString()),
          metadata: this.getAdaptiveMetadata(),
        },
      );

      return model;
      } catch (error) {
        this.logger.error('Error in remove', { error: error instanceof Error ? error.message : String(error) });
        if (error instanceof NotFoundException) throw error;
        throw new InternalServerErrorException('Error interno eliminando producto');
      }
   }

async getStats() {
     const products = await this.productsRepository.find();
     const totalProducts = products.length;

      const totalQuantity = products.reduce(
        (acc: number, product: any) => acc + product.quantity,
        0,
      );

      const totalInventoryValue = products.reduce(
        (acc: number, product: any) => acc + parseFloat(product.price.toString()) * product.quantity,
        0,
      );

     const averagePrice =
       totalQuantity > 0 ? totalInventoryValue / totalQuantity : 0;

      const productsByCategory = products.reduce((acc: Record<string, number>, product: any) => {
        acc[product.category] = (acc[product.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

     return {
       totalProducts,
       totalQuantity,
       totalInventoryValue,
       averagePrice,
       productsByCategory,
       generatedAt: new Date().toLocaleString('es-EC', {
         timeZone: 'America/Guayaquil',
       }),
       message: 'Reporte estadístico generado correctamente',
     };
   }

   private entityToModel(entity: ProductEntity): Product {
      const product = new Product(
        entity.id,
        entity.name,
        entity.category,
        entity.quantity,
        entity.price as number,
        entity.description,
      );
      product.createdAt = entity.createdAt;
      product.updatedAt = entity.updatedAt;
      return product;
   }
}
