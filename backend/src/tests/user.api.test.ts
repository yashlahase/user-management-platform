import request from 'supertest';
import app from '../app';
import { prisma } from '../config/database';

jest.mock('../config/database', () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

const mockUserDb = prisma.user as any;

describe('User API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    it('should return UP and 200', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('UP');
    });
  });

  describe('GET /api/v1/invalid-route', () => {
    it('should return 404 operational error', async () => {
      const res = await request(app).get('/api/v1/invalid-route');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('The requested route does not exist.');
    });
  });

  describe('POST /api/v1/users', () => {
    const validBody = {
      name: 'Yash Sharma',
      email: 'yash@example.com',
      primaryMobile: '9876543210',
      aadhaar: '123456789012',
      pan: 'ABCDE1234F',
      dateOfBirth: '1995-08-15',
      placeOfBirth: 'Delhi',
      currentAddress: 'Address 1',
      permanentAddress: 'Address 2',
    };

    it('should create user and return 201 on success', async () => {
      const mockCreatedUser = {
        id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
        ...validBody,
        secondaryMobile: null,
        version: 1,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        createdBy: 'SYSTEM_ADMIN',
        updatedBy: null,
        remarks: null,
        status: 'ACTIVE',
      };

      mockUserDb.findFirst.mockResolvedValue(null);
      mockUserDb.create.mockResolvedValue(mockCreatedUser);

      const res = await request(app)
        .post('/api/v1/users')
        .send(validBody);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d');
    });

    it('should return 400 validation error if email is invalid', async () => {
      const res = await request(app)
        .post('/api/v1/users')
        .send({ ...validBody, email: 'notanemail' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Validation Error');
      expect(res.body.errors[0].field).toBe('email');
    });

    it('should return 409 if duplicate email is found', async () => {
      mockUserDb.findFirst.mockResolvedValue({ id: 'existing-id' });

      const res = await request(app)
        .post('/api/v1/users')
        .send(validBody);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('is already registered');
    });
  });

  describe('GET /api/v1/users', () => {
    it('should return 200 and list of users with pagination metadata', async () => {
      const mockUsers = [
        { id: '1', name: 'Yash' },
        { id: '2', name: 'Kabir' },
      ];
      mockUserDb.findMany.mockResolvedValue(mockUsers);
      mockUserDb.count.mockResolvedValue(2);

      const res = await request(app).get('/api/v1/users?page=1&limit=2');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.pagination).toEqual({
        page: 1,
        limit: 2,
        totalItems: 2,
        totalPages: 1,
      });
    });
  });

  describe('GET /api/v1/users/:id', () => {
    it('should return user and 200 on success', async () => {
      const mockUser = {
        id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
        name: 'Yash',
        email: 'yash@example.com',
        isDeleted: false,
      };
      mockUserDb.findFirst.mockResolvedValue(mockUser);

      const res = await request(app).get('/api/v1/users/9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Yash');
    });

    it('should return 404 if user does not exist', async () => {
      mockUserDb.findFirst.mockResolvedValue(null);

      const res = await request(app).get('/api/v1/users/9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 if ID is not a valid UUID', async () => {
      const res = await request(app).get('/api/v1/users/123-not-uuid');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors[0].field).toBe('id');
    });

    it('should return 500 internal server error on unexpected database crash', async () => {
      mockUserDb.findFirst.mockRejectedValue(new Error('Database crashed completely'));

      const res = await request(app).get('/api/v1/users/9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('An unexpected internal server error occurred.');
    });
  });

  describe('PUT /api/v1/users/:id', () => {
    const updateBody = {
      name: 'Yash Updated',
      version: 1,
    };

    it('should return 200 on successful update', async () => {
      const mockUser = {
        id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
        name: 'Yash',
        version: 1,
        isDeleted: false,
      };
      mockUserDb.findFirst
        .mockResolvedValueOnce(mockUser) // findById inside service
        .mockResolvedValueOnce({ ...mockUser, name: 'Yash Updated', version: 2 }); // findById inside repo update

      mockUserDb.updateMany.mockResolvedValue({ count: 1 });

      const res = await request(app)
        .put('/api/v1/users/9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d')
        .send(updateBody);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.version).toBe(2);
      expect(res.body.data.name).toBe('Yash Updated');
    });

    it('should return 400 if version is missing', async () => {
      const res = await request(app)
        .put('/api/v1/users/9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d')
        .send({ name: 'Yash' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors[0].field).toBe('version');
    });
  });

  describe('DELETE /api/v1/users/:id', () => {
    it('should return 200 on soft delete', async () => {
      mockUserDb.update.mockResolvedValue({
        id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
        isDeleted: true,
      });

      const res = await request(app).delete('/api/v1/users/9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isDeleted).toBe(true);
    });
  });

  describe('PATCH /api/v1/users/:id/restore', () => {
    it('should return 200 on user restore', async () => {
      mockUserDb.update.mockResolvedValue({
        id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
        isDeleted: false,
      });

      const res = await request(app).patch('/api/v1/users/9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d/restore');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isDeleted).toBe(false);
    });
  });

  describe('CORS behavior', () => {
    it('should allow requests with no origin', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.headers['access-control-allow-origin']).toBeUndefined();
    });

    it('should allow requests from whitelisted origins', async () => {
      const res = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:3000');
      expect(res.status).toBe(200);
      expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    });

    it('should allow requests from Vercel preview deployments', async () => {
      const res = await request(app)
        .get('/health')
        .set('Origin', 'https://user-management-platform-gy41guy49-yashlahases-projects.vercel.app');
      expect(res.status).toBe(200);
      expect(res.headers['access-control-allow-origin']).toBe('https://user-management-platform-gy41guy49-yashlahases-projects.vercel.app');
    });

    it('should allow arbitrary localhost origins in non-production environments', async () => {
      const res = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:9999');
      expect(res.status).toBe(200);
      expect(res.headers['access-control-allow-origin']).toBe('http://localhost:9999');
    });

    it('should block requests from unauthorized domains', async () => {
      const res = await request(app)
        .get('/health')
        .set('Origin', 'https://maliciousdomain.com');
      expect(res.status).toBe(200);
      expect(res.headers['access-control-allow-origin']).toBeUndefined();
    });
  });
});
