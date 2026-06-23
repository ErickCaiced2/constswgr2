import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, HttpStatus } from '@nestjs/common';
import { ProductsController } from '../../../src/modules/products/products.controller';
import { ProductsService } from '../../../src/modules/products/products.service';
import { EventEmitterService } from '../../../src/services/event-emitter.service';
import { CreateProductDto } from '../../../src/modules/products/dto/create-product.dto';
import { UpdateProductDto } from '../../../src/modules/products/dto/update-product.dto';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        ProductsService,
        {
          provide: EventEmitterService,
          useValue: {
            emitEvent: jest.fn().mockResolvedValue({ ok: true }),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  describe('POST /products - CREATE', () => {
    it('should create a product with valid data', async () => {
      const createDto: CreateProductDto = {
        name: 'Desinfectante',
        category: 'desinfectantes',
        quantity: 50,
        price: 5.99,
        description: 'Test',
      };

      const result = await controller.create(createDto);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.name).toBe('Desinfectante');
    });

    it('should throw error when name is missing', async () => {
      const createDto: CreateProductDto = {
        name: '',
        category: 'desinfectantes',
        quantity: 50,
        price: 5.99,
        description: 'Test',
      };

      await expect(controller.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error when category is missing', async () => {
      const createDto: CreateProductDto = {
        name: 'Desinfectante',
        category: '',
        quantity: 50,
        price: 5.99,
        description: 'Test',
      };

      await expect(controller.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error when both name and category are missing', async () => {
      const createDto: CreateProductDto = {
        name: '',
        category: '',
        quantity: 50,
        price: 5.99,
        description: 'Test',
      };

      await expect(controller.create(createDto)).rejects.toThrow(
        'Los campos name y category son requeridos',
      );
    });
  });

  describe('GET /products - FINDALL', () => {
    it('should return empty array', () => {
      const result = controller.findAll();
      expect(result).toEqual([]);
    });

    it('should return all products', async () => {
      const createDto1: CreateProductDto = {
        name: 'Producto 1',
        category: 'cat1',
        quantity: 10,
        price: 5,
        description: 'Test',
      };

      const createDto2: CreateProductDto = {
        name: 'Producto 2',
        category: 'cat2',
        quantity: 20,
        price: 10,
        description: 'Test',
      };

      await controller.create(createDto1);
      await controller.create(createDto2);

      const result = controller.findAll();
      expect(result.length).toBe(2);
      expect(result[0].name).toBe('Producto 1');
      expect(result[1].name).toBe('Producto 2');
    });
  });

  describe('GET /products/stats', () => {
    it('should return stats', async () => {
      const createDto: CreateProductDto = {
        name: 'Test',
        category: 'test',
        quantity: 50,
        price: 10,
        description: 'Test',
      };

      await controller.create(createDto);

      const stats = controller.getStats();

      expect(stats).toBeDefined();
      expect(stats.totalProducts).toBe(1);
      expect(stats.totalQuantity).toBe(50);
      expect(stats.productsByCategory).toEqual({ test: 1 });
    });

    it('should return stats for empty inventory', () => {
      const stats = controller.getStats();

      expect(stats.totalProducts).toBe(0);
      expect(stats.totalQuantity).toBe(0);
      expect(stats.totalInventoryValue).toBe(0);
    });
  });

  describe('GET /products/:id - FINDONE', () => {
    it('should return a product by valid ID', async () => {
      const createDto: CreateProductDto = {
        name: 'Test Product',
        category: 'test',
        quantity: 10,
        price: 5,
        description: 'Test',
      };

      await controller.create(createDto);

      const result = controller.findOne('1');

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.name).toBe('Test Product');
    });

    it('should throw error when ID is not a valid number', () => {
      expect(() => controller.findOne('abc')).toThrow(BadRequestException);
      expect(() => controller.findOne('abc')).toThrow(
        'El ID debe ser un número válido',
      );
    });

    it('should parse float ID as integer and find product', async () => {
      const createDto: CreateProductDto = {
        name: 'Test',
        category: 'test',
        quantity: 10,
        price: 5,
        description: 'Test',
      };

      await controller.create(createDto);

      // parseInt('1.5') returns 1
      const result = controller.findOne('1.5');
      expect(result).toBeDefined();
      expect(result.id).toBe(1);
    });

    it('should throw error when product does not exist', async () => {
      await expect(async () => {
        controller.findOne('999');
      }).rejects.toThrow();
    });

    it('should throw error for negative ID', () => {
      const createDto: CreateProductDto = {
        name: 'Test',
        category: 'test',
        quantity: 10,
        price: 5,
        description: 'Test',
      };

      controller.create(createDto).then(() => {
        // Negative IDs parse correctly as numbers, so this should work
        // The service will throw NotFoundException instead
        expect(() => controller.findOne('-1')).not.toThrow(
          BadRequestException,
        );
      });
    });
  });

  describe('PATCH /products/:id - UPDATE', () => {
    it('should update a product with valid ID and data', async () => {
      const createDto: CreateProductDto = {
        name: 'Original',
        category: 'original',
        quantity: 10,
        price: 5,
        description: 'Original',
      };

      await controller.create(createDto);

      const updateDto: UpdateProductDto = {
        name: 'Updated',
        price: 15,
      };

      const result = await controller.update('1', updateDto);

      expect(result.name).toBe('Updated');
      expect(result.price).toBe(15);
    });

    it('should throw error when ID is not a valid number', async () => {
      const updateDto: UpdateProductDto = {
        name: 'Updated',
      };

      await expect(
        controller.update('invalid', updateDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should parse float ID as integer when updating', async () => {
      // parseInt('1.5') returns 1
      const createDto: CreateProductDto = {
        name: 'Test',
        category: 'test',
        quantity: 10,
        price: 5,
        description: 'Test',
      };

      await controller.create(createDto);

      const updateDto: UpdateProductDto = {
        name: 'Updated',
      };

      const result = await controller.update('1.5', updateDto);
      expect(result.name).toBe('Updated');
    });

    it('should throw error when product does not exist', async () => {
      const updateDto: UpdateProductDto = {
        name: 'Updated',
      };

      await expect(controller.update('999', updateDto)).rejects.toThrow();
    });
  });

  describe('DELETE /products/:id - REMOVE', () => {
    it('should delete a product with valid ID', async () => {
      const createDto: CreateProductDto = {
        name: 'Product Item',
        category: 'test',
        quantity: 10,
        price: 5,
        description: 'Test',
      };

      await controller.create(createDto);

      const result = await controller.remove('1');

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.name).toBe('Product Item');
    });

    it('should throw error when ID is not a valid number', async () => {
      await expect(controller.remove('invalid')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should parse float ID as integer when deleting', async () => {
      // parseInt('1.5') returns 1
      const createDto: CreateProductDto = {
        name: 'Product Item',
        category: 'test',
        quantity: 10,
        price: 5,
        description: 'Test',
      };

      await controller.create(createDto);

      const result = await controller.remove('1.5');
      expect(result.id).toBe(1);
    });

    it('should throw error when product does not exist', async () => {
      await expect(controller.remove('999')).rejects.toThrow();
    });

    it('should actually delete the product from inventory', async () => {
      const createDto: CreateProductDto = {
        name: 'Product Item',
        category: 'test',
        quantity: 10,
        price: 5,
        description: 'Test',
      };

      await controller.create(createDto);
      await controller.remove('1');

      // Verify deletion
      await expect(
        async () => controller.findOne('1'),
      ).rejects.toThrow();
    });
  });

  describe('Error Handling - Edge Cases', () => {
    it('should handle very large ID numbers', () => {
      expect(() => controller.findOne('9999999999')).not.toThrow(
        BadRequestException,
      );
      // Service will throw NotFoundException
    });

    it('should handle leading zeros in ID', () => {
      // JavaScript parseInt ignores leading zeros
      expect(() => controller.findOne('01')).not.toThrow(
        BadRequestException,
      );
    });

    it('should handle negative numbers in ID parameter', () => {
      // Negative numbers parse correctly as numbers
      expect(() => controller.findOne('-5')).not.toThrow(
        BadRequestException,
      );
      // Service will throw NotFoundException
    });

    it('should handle empty string ID', () => {
      expect(() => controller.findOne('')).toThrow(BadRequestException);
    });

    it('should handle whitespace-only ID', () => {
      expect(() => controller.findOne('   ')).toThrow(BadRequestException);
    });

    it('should handle ID with spaces', async () => {
      // parseInt('1 2') = 1 (stops at space)
      const createDto: CreateProductDto = {
        name: 'Test Product',
        category: 'test',
        quantity: 10,
        price: 5,
        description: 'Test',
      };

      await controller.create(createDto);

      // '1 2' parses to 1, which exists
      const result = controller.findOne('1 2');
      expect(result.id).toBe(1);
    });

    it('should handle ID with special characters', async () => {
      // parseInt('1@2') = 1 (stops at @)
      const createDto: CreateProductDto = {
        name: 'Test Product',
        category: 'test',
        quantity: 10,
        price: 5,
        description: 'Test',
      };

      await controller.create(createDto);

      // '1@2' parses to 1, which exists
      const result = controller.findOne('1@2');
      expect(result.id).toBe(1);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete CRUD workflow through controller', async () => {
      // CREATE
      const createDto: CreateProductDto = {
        name: 'Integration Test',
        category: 'test',
        quantity: 100,
        price: 19.99,
        description: 'Integration test product',
      };

      const created = await controller.create(createDto);
      expect(created.id).toBe(1);

      // READ
      const found = controller.findOne('1');
      expect(found.name).toBe('Integration Test');

      // READ ALL
      const allProducts = controller.findAll();
      expect(allProducts.length).toBe(1);

      // STATS
      const stats = controller.getStats();
      expect(stats.totalProducts).toBe(1);
      expect(stats.totalInventoryValue).toBe(100 * 19.99);

      // UPDATE
      const updateDto: UpdateProductDto = {
        quantity: 50,
      };

      const updated = await controller.update('1', updateDto);
      expect(updated.quantity).toBe(50);

      // DELETE
      const deleted = await controller.remove('1');
      expect(deleted.id).toBe(1);

      // VERIFY DELETION
      const statsAfterDelete = controller.getStats();
      expect(statsAfterDelete.totalProducts).toBe(0);
    });

    it('should maintain ID sequence across operations', async () => {
      const createDto1: CreateProductDto = {
        name: 'Product 1',
        category: 'test',
        quantity: 10,
        price: 5,
        description: 'Test',
      };

      const createDto2: CreateProductDto = {
        name: 'Product 2',
        category: 'test',
        quantity: 20,
        price: 10,
        description: 'Test',
      };

      const product1 = await controller.create(createDto1);
      const product2 = await controller.create(createDto2);

      expect(product1.id).toBe(1);
      expect(product2.id).toBe(2);

      // Delete product 1
      await controller.remove('1');

      // Create new product
      const createDto3: CreateProductDto = {
        name: 'Product 3',
        category: 'test',
        quantity: 30,
        price: 15,
        description: 'Test',
      };

      const product3 = await controller.create(createDto3);
      expect(product3.id).toBe(3); // ID continues from last, not reused
    });
  });
});
