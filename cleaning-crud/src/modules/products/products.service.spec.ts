import { ProductsService } from './products.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ProductsService (unit)', () => {
  let service: ProductsService;
  let repo: any;
  let eventEmitter: any;
  let logger: any;

  beforeEach(() => {
    repo = {
      create: jest.fn((obj) => obj),
      save: jest.fn(async (obj) => ({ id: obj.id || 1, ...obj })),
      find: jest.fn(async () => []),
      findOne: jest.fn(async (query) => undefined),
      remove: jest.fn(async (obj) => obj),
    };

    eventEmitter = { emitEvent: jest.fn() };
    logger = { info: jest.fn(), error: jest.fn(), warn: jest.fn() };

    // @ts-ignore create service with mocked dependencies
    service = new ProductsService(repo, eventEmitter, logger);
  });

  test('CREATE should reject duplicate id when provided', async () => {
    // simulate existing product with id=5
    repo.findOne = jest.fn(async (q) => ({ id: 5, name: 'X' }));
    await expect(service.create({ id: 5, name: 'X', category: 'C', quantity: 1, price: 1, description: '' })).rejects.toThrow(BadRequestException);
  });

  test('READ by id returns entity', async () => {
    const now = new Date();
    repo.findOne = jest.fn(async (q) => ({ id: 10, name: 'Soap', category: 'Hygiene', quantity: 2, price: 3.5, description: 'desc', createdAt: now, updatedAt: now, deleted: false }));
    const prod = await service.findOne(10);
    expect(prod.id).toBe(10);
    expect(prod.name).toBe('Soap');
  });

  test('UPDATE rejects negative price', async () => {
    repo.findOne = jest.fn(async (q) => ({ id: 2, name: 'P', category: 'C', quantity: 1, price: 5, description: '', createdAt: new Date(), updatedAt: new Date(), deleted: false }));
    await expect(service.update(2, { price: -10 })).rejects.toThrow(BadRequestException);
  });

  test('DELETE logical vs physical', async () => {
    // logical
    process.env.LOGICAL_DELETE = 'true';
    const entity = { id: 3, name: 'D', category: 'C', quantity: 1, price: 1, description: '', createdAt: new Date(), updatedAt: new Date(), deleted: false };
    repo.findOne = jest.fn(async (q) => entity);
    repo.save = jest.fn(async (obj) => ({ ...obj }));
    await service.remove(3);
    expect(repo.save).toHaveBeenCalled();
    expect(entity.deleted).toBe(true);

    // physical
    process.env.LOGICAL_DELETE = 'false';
    const entity2 = { id: 4, name: 'E', category: 'C', quantity: 1, price: 1, description: '', createdAt: new Date(), updatedAt: new Date(), deleted: false };
    repo.findOne = jest.fn(async (q) => entity2);
    repo.remove = jest.fn(async (obj) => obj);
    await service.remove(4);
    expect(repo.remove).toHaveBeenCalled();
  });
});

