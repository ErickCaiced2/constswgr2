import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Product } from './product.model';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { EventEmitterService } from '../../services/event-emitter.service';

@Injectable()
export class ProductsService {
  private products: Product[] = [];
  private nextId = 1;

  constructor(private eventEmitter: EventEmitterService) {}

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
    throw new BadRequestException(
      'El nombre del producto es obligatorio',
    );
  }

  if (
    !createProductDto.category ||
    createProductDto.category.trim() === ''
  ) {
    throw new BadRequestException(
      'La categoría del producto es obligatoria',
    );
  }

  if (createProductDto.quantity < 0) {
    throw new BadRequestException(
      'La cantidad no puede ser negativa',
    );
  }

  if (createProductDto.price < 0) {
    throw new BadRequestException(
      'El precio no puede ser negativo',
    );
  }

  const product = new Product(
    this.nextId++,
    createProductDto.name,
    createProductDto.category,
    createProductDto.quantity,
    createProductDto.price,
    createProductDto.description,
  );

  this.products.push(product);

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

  findAll(): Product[] {

    this.eventEmitter.emitEvent(
      'QUERY',
      'product',
      'Listado de productos consultado',
      `Se consultó el listado completo de ${this.products.length} productos`,
      {
        count: this.products.length,
        totalValue: this.products.reduce(
          (acc, p) => acc + p.price * p.quantity,
          0,
        ),
        metadata: this.getAdaptiveMetadata(),
      },
    );

    return this.products;
  }

  findOne(id: number): Product {
    const product = this.products.find((p) => p.id === id);

    if (!product) {
      throw new NotFoundException(
        `Producto con ID ${id} no encontrado en la base de datos`,
      );
    }


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

    return product;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = this.products.find((p) => p.id === id);

    if (!product) {
      throw new NotFoundException(
        `Producto con ID ${id} no encontrado. No se puede actualizar.`,
      );
    }

    const previousValues = {
      name: product.name,
      category: product.category,
      quantity: product.quantity,
      price: product.price,
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

    product.updatedAt = new Date();


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

    return product;
  }

  async remove(id: number): Promise<Product> {
    const productIndex = this.products.findIndex((p) => p.id === id);

    if (productIndex === -1) {
      throw new NotFoundException(
        `Producto con ID ${id} no encontrado. No se puede eliminar.`,
      );
    }

    const [removedProduct] = this.products.splice(productIndex, 1);


    await this.eventEmitter.emitEvent(
      'DELETE',
      'product',
      `Producto eliminado: ${removedProduct.name}`,
      `Se eliminó el producto con ID ${id} de la base de datos`,
      {
        id: removedProduct.id,
        name: removedProduct.name,
        category: removedProduct.category,
        quantity: removedProduct.quantity,
        price: removedProduct.price,
        metadata: this.getAdaptiveMetadata(),
      },
    );

    return removedProduct;
  }

  getStats() {
    const totalProducts = this.products.length;

    const totalQuantity = this.products.reduce(
      (acc, product) => acc + product.quantity,
      0,
    );

    const totalInventoryValue = this.products.reduce(
      (acc, product) => acc + product.price * product.quantity,
      0,
    );

    const averagePrice =
      totalQuantity > 0 ? totalInventoryValue / totalQuantity : 0;

    const productsByCategory = this.products.reduce((acc, product) => {
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
}
