import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from '../../../src/modules/events/events.service';
import { CreateEventDto } from '../../../src/modules/events/dto/create-event.dto';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateEventEntity } from '../../../src/database/entities/create-event.entity';
import { UpdateEventEntity } from '../../../src/database/entities/update-event.entity';
import { DeleteEventEntity } from '../../../src/database/entities/delete-event.entity';
import { QueryEventEntity } from '../../../src/database/entities/query-event.entity';

describe('EventsService - DELETE Event Fix', () => {
  let service: EventsService;

  const mockRepositories = {
    create: {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn().mockResolvedValue([]),
    },
    update: {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn().mockResolvedValue([]),
    },
    delete: {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn().mockResolvedValue([]),
    },
    query: {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn().mockResolvedValue([]),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: getRepositoryToken(CreateEventEntity),
          useValue: mockRepositories.create,
        },
        {
          provide: getRepositoryToken(UpdateEventEntity),
          useValue: mockRepositories.update,
        },
        {
          provide: getRepositoryToken(DeleteEventEntity),
          useValue: mockRepositories.delete,
        },
        {
          provide: getRepositoryToken(QueryEventEntity),
          useValue: mockRepositories.query,
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('CREATE Event', () => {
    it('should register a CREATE event successfully', async () => {
      const createEventDto: CreateEventDto = {
        source: 'cleaning-crud',
        entity: 'product',
        action: 'CREATE',
        title: 'Producto creado',
        description: 'Se creó un nuevo producto',
        payload: { id: 1, name: 'Desinfectante' },
      };

      mockRepositories.create.create.mockReturnValue({
        source: createEventDto.source,
        entity: createEventDto.entity,
      });

      const result = await service.registerEvent(createEventDto);

      expect(result.ok).toBe(true);
      expect(mockRepositories.create.create).toHaveBeenCalled();
      expect(mockRepositories.create.save).toHaveBeenCalled();
    });

    it('should store CREATE event with correct payload format', async () => {
      const createEventDto: CreateEventDto = {
        source: 'cleaning-crud',
        entity: 'product',
        action: 'CREATE',
        title: 'Producto creado',
        description: 'Se creó un nuevo producto',
        payload: { id: 1, name: 'Desinfectante', price: 5.99 },
      };

      mockRepositories.create.create.mockReturnValue({});

      await service.registerEvent(createEventDto);

      const createCall = mockRepositories.create.create.mock.calls[0][0];
      expect(createCall.payload).toBe(JSON.stringify(createEventDto.payload));
      expect(createCall.source).toBe('cleaning-crud');
      expect(createCall.entity).toBe('product');
      expect(createCall.action).toBe('CREATE');
    });
  });

  describe('UPDATE Event', () => {
    it('should register an UPDATE event successfully', async () => {
      const updateEventDto: CreateEventDto = {
        source: 'cleaning-crud',
        entity: 'product',
        action: 'UPDATE',
        title: 'Producto actualizado',
        description: 'Se actualizó el producto',
        payload: { id: 1, name: 'Desinfectante Updated' },
      };

      mockRepositories.update.create.mockReturnValue({});

      const result = await service.registerEvent(updateEventDto);

      expect(result.ok).toBe(true);
      expect(mockRepositories.update.create).toHaveBeenCalled();
      expect(mockRepositories.update.save).toHaveBeenCalled();
    });

    it('should store UPDATE event with correct payload format', async () => {
      const updateEventDto: CreateEventDto = {
        source: 'cleaning-crud',
        entity: 'product',
        action: 'UPDATE',
        title: 'Actualización',
        description: 'Descripción',
        payload: { id: 1, previousValue: 'old', newValue: 'new' },
      };

      mockRepositories.update.create.mockReturnValue({});

      await service.registerEvent(updateEventDto);

      const updateCall = mockRepositories.update.create.mock.calls[0][0];
      expect(updateCall.payload).toBe(JSON.stringify(updateEventDto.payload));
      expect(updateCall.source).toBe('cleaning-crud');
      expect(updateCall.entity).toBe('product');
      expect(updateCall.action).toBe('UPDATE');
    });
  });

  describe('DELETE Event - CORRECCIÓN VERIFICADA', () => {
    it('should register a DELETE event successfully', async () => {
      const deleteEventDto: CreateEventDto = {
        source: 'cleaning-crud',
        entity: 'product',
        action: 'DELETE',
        title: 'Producto eliminado',
        description: 'Se eliminó un producto',
        payload: { id: 1, name: 'Desinfectante' },
      };

      mockRepositories.delete.create.mockReturnValue({
        source: deleteEventDto.source,
        entity: deleteEventDto.entity,
        action: deleteEventDto.action,
      });

      const result = await service.registerEvent(deleteEventDto);

      expect(result.ok).toBe(true);
      expect(mockRepositories.delete.create).toHaveBeenCalled();
      expect(mockRepositories.delete.save).toHaveBeenCalled();
    });

    it('should persist DELETE event to database correctly', async () => {
      const deleteEventDto: CreateEventDto = {
        source: 'cleaning-crud',
        entity: 'product',
        action: 'DELETE',
        title: 'Producto eliminado',
        description: 'Se eliminó el producto con ID 1',
        payload: { id: 1, name: 'Desinfectante', quantity: 50 },
      };

      const mockDeleteEntity = {
        source: 'cleaning-crud',
        entity: 'product',
        action: 'DELETE',
        title: 'Producto eliminado',
        payload: JSON.stringify(deleteEventDto.payload),
        createdAt: expect.any(String),
      };

      mockRepositories.delete.create.mockReturnValue(mockDeleteEntity);

      await service.registerEvent(deleteEventDto);

      // Verify create was called with correct data
      expect(mockRepositories.delete.create).toHaveBeenCalledWith({
        source: 'cleaning-crud',
        entity: 'product',
        action: 'DELETE',
        title: 'Producto eliminado',
        payload: JSON.stringify(deleteEventDto.payload),
        createdAt: expect.any(String),
      });

      // Verify save was called
      expect(mockRepositories.delete.save).toHaveBeenCalledWith(
        mockDeleteEntity,
      );
    });

    it('should have createdAt timestamp in DELETE event', async () => {
      const deleteEventDto: CreateEventDto = {
        source: 'cleaning-crud',
        entity: 'product',
        action: 'DELETE',
        title: 'Producto eliminado',
        description: 'Descripción',
        payload: { id: 1 },
      };

      mockRepositories.delete.create.mockImplementation((data) => data);

      await service.registerEvent(deleteEventDto);

      const createCall = mockRepositories.delete.create.mock.calls[0][0];

      expect(createCall).toHaveProperty('createdAt');
      expect(typeof createCall.createdAt).toBe('string');
      // The createdAt is a localeString, so just verify it's a non-empty string
      expect(createCall.createdAt.length).toBeGreaterThan(0);
    });

    it('should preserve payload integrity in DELETE event', async () => {
      const complexPayload = {
        id: 1,
        name: 'Desinfectante Premium',
        category: 'desinfectantes',
        quantity: 50,
        price: 5.99,
        description: 'Desinfectante multiusos de alta calidad',
        metadata: {
          source: 'cleaning-crud',
          apiVersion: 'v1',
        },
      };

      const deleteEventDto: CreateEventDto = {
        source: 'cleaning-crud',
        entity: 'product',
        action: 'DELETE',
        title: 'Producto eliminado',
        description: 'Se eliminó producto premium',
        payload: complexPayload,
      };

      mockRepositories.delete.create.mockImplementation((data) => data);

      await service.registerEvent(deleteEventDto);

      const createCall = mockRepositories.delete.create.mock.calls[0][0];
      const savedPayload = JSON.parse(createCall.payload);

      expect(savedPayload).toEqual(complexPayload);
      expect(savedPayload.id).toBe(1);
      expect(savedPayload.name).toBe('Desinfectante Premium');
      expect(savedPayload.metadata.source).toBe('cleaning-crud');
    });

    it('should correctly differentiate DELETE from other actions', async () => {
      const deleteEventDto: CreateEventDto = {
        source: 'cleaning-crud',
        entity: 'product',
        action: 'DELETE',
        title: 'Producto eliminado',
        description: 'Descripción',
        payload: { id: 1 },
      };

      mockRepositories.delete.create.mockReturnValue({});
      mockRepositories.create.create.mockReturnValue({});
      mockRepositories.update.create.mockReturnValue({});

      await service.registerEvent(deleteEventDto);

      // Only deleteRepo should have been called
      expect(mockRepositories.delete.create).toHaveBeenCalled();
      expect(mockRepositories.create.create).not.toHaveBeenCalled();
      expect(mockRepositories.update.create).not.toHaveBeenCalled();
    });
  });

  describe('QUERY Event', () => {
    it('should register a QUERY event successfully', async () => {
      const queryEventDto: CreateEventDto = {
        source: 'cleaning-crud',
        entity: 'product',
        action: 'QUERY',
        title: 'Producto consultado',
        description: 'Se consultó el producto',
        payload: { id: 1 },
      };

      mockRepositories.query.create.mockReturnValue({});

      const result = await service.registerEvent(queryEventDto);

      expect(result.ok).toBe(true);
      expect(mockRepositories.query.create).toHaveBeenCalled();
      expect(mockRepositories.query.save).toHaveBeenCalled();
    });

    it('should store QUERY event with correct payload format', async () => {
      const queryEventDto: CreateEventDto = {
        source: 'cleaning-crud',
        entity: 'product',
        action: 'QUERY',
        title: 'Listado consultado',
        description: 'Se consultó el listado',
        payload: { count: 5, totalValue: 100 },
      };

      mockRepositories.query.create.mockReturnValue({});

      await service.registerEvent(queryEventDto);

      const queryCall = mockRepositories.query.create.mock.calls[0][0];
      expect(queryCall.payload).toBe(JSON.stringify(queryEventDto.payload));
    });
  });

  describe('Action Case Insensitivity', () => {
    it('should handle lowercase action values', async () => {
      const deleteEventDto: CreateEventDto = {
        source: 'cleaning-crud',
        entity: 'product',
        action: 'delete',
        title: 'Producto eliminado',
        description: 'Descripción',
        payload: { id: 1 },
      };

      mockRepositories.delete.create.mockReturnValue({});

      const result = await service.registerEvent(deleteEventDto);

      expect(result.ok).toBe(true);
      expect(mockRepositories.delete.create).toHaveBeenCalled();
    });

    it('should handle mixed case action values', async () => {
      const deleteEventDto: CreateEventDto = {
        source: 'cleaning-crud',
        entity: 'product',
        action: 'DeLeTE',
        title: 'Producto eliminado',
        description: 'Descripción',
        payload: { id: 1 },
      };

      mockRepositories.delete.create.mockReturnValue({});

      const result = await service.registerEvent(deleteEventDto);

      expect(result.ok).toBe(true);
      expect(mockRepositories.delete.create).toHaveBeenCalled();
    });
  });

  describe('Invalid Action Handling', () => {
    it('should return ok:false for unknown action', async () => {
      const unknownEventDto: CreateEventDto = {
        source: 'cleaning-crud',
        entity: 'product',
        action: 'UNKNOWN',
        title: 'Acción desconocida',
        description: 'Descripción',
        payload: { id: 1 },
      };

      const result = await service.registerEvent(unknownEventDto);

      expect(result.ok).toBe(false);
    });

    it('should return ok:false for empty action', async () => {
      const emptyActionDto: CreateEventDto = {
        source: 'cleaning-crud',
        entity: 'product',
        action: '',
        title: 'Acción vacía',
        description: 'Descripción',
        payload: { id: 1 },
      };

      const result = await service.registerEvent(emptyActionDto);

      expect(result.ok).toBe(false);
    });
  });

  describe('Payload Handling', () => {
    it('should handle null payload gracefully', async () => {
      const eventDto: CreateEventDto = {
        source: 'cleaning-crud',
        entity: 'product',
        action: 'DELETE',
        title: 'Producto eliminado',
        description: 'Descripción',
        payload: null as any,
      };

      mockRepositories.delete.create.mockImplementation((data) => data);

      await service.registerEvent(eventDto);

      const createCall = mockRepositories.delete.create.mock.calls[0][0];
      expect(createCall.payload).toBe(JSON.stringify({}));
    });

    it('should handle undefined payload gracefully', async () => {
      const eventDto: CreateEventDto = {
        source: 'cleaning-crud',
        entity: 'product',
        action: 'DELETE',
        title: 'Producto eliminado',
        description: 'Descripción',
        payload: undefined as any,
      };

      mockRepositories.delete.create.mockImplementation((data) => data);

      await service.registerEvent(eventDto);

      const createCall = mockRepositories.delete.create.mock.calls[0][0];
      expect(createCall.payload).toBe(JSON.stringify({}));
    });

    it('should handle large payload objects', async () => {
      const largePayload = {
        id: 1,
        description: 'a'.repeat(1000),
        data: Array(100).fill({ nested: 'data' }),
      };

      const eventDto: CreateEventDto = {
        source: 'cleaning-crud',
        entity: 'product',
        action: 'DELETE',
        title: 'Producto eliminado',
        description: 'Descripción',
        payload: largePayload,
      };

      mockRepositories.delete.create.mockImplementation((data) => data);

      await service.registerEvent(eventDto);

      const createCall = mockRepositories.delete.create.mock.calls[0][0];
      const savedPayload = JSON.parse(createCall.payload);

      expect(savedPayload).toEqual(largePayload);
    });
  });

  describe('All Events Combined', () => {
    it('should handle all event types in sequence', async () => {
      const events: CreateEventDto[] = [
        {
          source: 'cleaning-crud',
          entity: 'product',
          action: 'CREATE',
          title: 'Creado',
          description: 'Desc',
          payload: { id: 1 },
        },
        {
          source: 'cleaning-crud',
          entity: 'product',
          action: 'UPDATE',
          title: 'Actualizado',
          description: 'Desc',
          payload: { id: 1, name: 'Updated' },
        },
        {
          source: 'cleaning-crud',
          entity: 'product',
          action: 'QUERY',
          title: 'Consultado',
          description: 'Desc',
          payload: { id: 1 },
        },
        {
          source: 'cleaning-crud',
          entity: 'product',
          action: 'DELETE',
          title: 'Eliminado',
          description: 'Desc',
          payload: { id: 1 },
        },
      ];

      mockRepositories.create.create.mockReturnValue({});
      mockRepositories.update.create.mockReturnValue({});
      mockRepositories.query.create.mockReturnValue({});
      mockRepositories.delete.create.mockReturnValue({});

      for (const event of events) {
        const result = await service.registerEvent(event);
        expect(result.ok).toBe(true);
      }

      expect(mockRepositories.create.create).toHaveBeenCalled();
      expect(mockRepositories.update.create).toHaveBeenCalled();
      expect(mockRepositories.query.create).toHaveBeenCalled();
      expect(mockRepositories.delete.create).toHaveBeenCalled();
    });
  });
});
