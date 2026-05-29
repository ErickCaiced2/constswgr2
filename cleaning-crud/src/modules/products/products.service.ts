import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.model';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { EventEmitterService } from '../../services/event-emitter.service';
import { ProductEntity } from './product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private productsRepository: Repository<ProductEntity>,
    private eventEmitter: EventEmitterService,
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
}

async findAll(): Promise<Product[]> {
   const products = await this.productsRepository.find();
   const models = products.map(p => this.entityToModel(p));

   this.eventEmitter.emitEvent(
     'QUERY',
     'product',
     'Listado de productos consultado',
     `Se consultó el listado completo de ${products.length} productos`,
     {
       count: products.length,
       totalValue: products.reduce(
         (acc, p) => acc + parseFloat(p.price.toString()) * p.quantity,
         0,
       ),
       metadata: this.getAdaptiveMetadata(),
     },
   );

   return models;
 }

async findOne(id: number): Promise<Product> {
     const product = await this.productsRepository.findOne({ where: { id } });

     if (!product) {
       throw new NotFoundException(
         `Producto con ID ${id} no encontrado en la base de datos`,
       );
     }

     const model = this.entityToModel(product);

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
   }

async update(
     id: number,
     updateProductDto: UpdateProductDto,
   ): Promise<Product> {
     const product = await this.productsRepository.findOne({ where: { id } });

     if (!product) {
       throw new NotFoundException(
         `Producto con ID ${id} no encontrado. No se puede actualizar.`,
       );
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
   }

async remove(id: number): Promise<Product> {
     const product = await this.productsRepository.findOne({ where: { id } });

     if (!product) {
       throw new NotFoundException(
         `Producto con ID ${id} no encontrado. No se puede eliminar.`,
       );
     }

     const model = this.entityToModel(product);
     await this.productsRepository.remove(product);

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
   }

async getStats() {
     const products = await this.productsRepository.find();
     const totalProducts = products.length;

     const totalQuantity = products.reduce(
       (acc, product) => acc + product.quantity,
       0,
     );

     const totalInventoryValue = products.reduce(
       (acc, product) => acc + parseFloat(product.price.toString()) * product.quantity,
       0,
     );

     const averagePrice =
       totalQuantity > 0 ? totalInventoryValue / totalQuantity : 0;

     const productsByCategory = products.reduce((acc, product) => {
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
