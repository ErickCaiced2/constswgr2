import { Injectable, NotFoundException } from '@nestjs/common';
import { Product } from './product.model';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { EventEmitterService } from '../../services/event-emitter.service';

@Injectable()
export class ProductsService {
  private products: Product[] = [];
  private nextId = 1;

  constructor(private eventEmitter: EventEmitterService) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = new Product(
      this.nextId++,
      createProductDto.name,
      createProductDto.category,
      createProductDto.quantity,
      createProductDto.price,
      createProductDto.description,
    );

    this.products.push(product);

    // Emitir evento CREATE
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
      },
    );

    return product;
  }

  findAll(): Product[] {
    // Emitir evento QUERY
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

    // Emitir evento QUERY
    this.eventEmitter.emitEvent(
      'QUERY',
      'product',
      `Producto consultado: ${product.name}`,
      `Se consultó el producto con ID ${id}`,
      { id: product.id, name: product.name, category: product.category },
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

    // Aplicar cambios
    if (updateProductDto.name !== undefined) product.name = updateProductDto.name;
    if (updateProductDto.category !== undefined) product.category = updateProductDto.category;
    if (updateProductDto.quantity !== undefined) product.quantity = updateProductDto.quantity;
    if (updateProductDto.price !== undefined) product.price = updateProductDto.price;
    if (updateProductDto.description !== undefined) product.description = updateProductDto.description;

    product.updatedAt = new Date();

    // Emitir evento UPDATE
    await this.eventEmitter.emitEvent(
      'UPDATE',
      'product',
      `Producto actualizado: ${product.name}`,
      `Se actualizaron los datos del producto con ID ${id}`,
      {
        id: product.id,
        name: product.name,
        previousValues: previousValues,
        newValues: updateProductDto,
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

    // Emitir evento DELETE
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
        precio: removedProduct.price,
      },
    );

    return removedProduct;
  }
}

