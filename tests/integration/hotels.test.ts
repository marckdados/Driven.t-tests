import app, { init } from '@/app';
import faker from '@faker-js/faker';
import httpStatus from 'http-status';
import supertest from 'supertest';
import { cleanDb, generateValidToken } from '../helpers';
import * as jwt from 'jsonwebtoken';
import {
  createEnrollmentWithAddress,
  createTicketTypeWithIsRemoteFalseAndIncludesHotel,
  createUser,
} from '../factories';
import ticketRepository from '@/repositories/ticket-repository';
import { CreateTicketParams } from '@/repositories/ticket-repository';
import { TicketStatus } from '@prisma/client';
import { createHotel, createRoom } from '../factories/hotels-factory';

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe('GET /hotels', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/hotels');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if token is not valid', async () => {
    const token = faker.lorem.word();
    const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    // cria um usuário anonimo
    const userWithoutSession = await createUser();

    // cria um token
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  //testes com token valido

  describe('when token is valid', () => {
    it('must respond with 404 when token is valid but no enrollment, ticket and hotel created !', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('must respond with 404 when token is valid with enrollment created but ticket and hotel no created !', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);
      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('must respond with 404 when token is valid with enrollment and ticket created, but hotel no created !', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithIsRemoteFalseAndIncludesHotel();
      const data: CreateTicketParams = {
        ticketTypeId: ticketType.id,
        enrollmentId: enrollment.id,
        status: TicketStatus.PAID,
      };
      await ticketRepository.createTicket(data);

      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should return with status 200 when enrollment, ticket and hotel created', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithIsRemoteFalseAndIncludesHotel();
      const data: CreateTicketParams = {
        ticketTypeId: ticketType.id,
        enrollmentId: enrollment.id,
        status: TicketStatus.PAID,
      };
      await ticketRepository.createTicket(data);
      const hotel = await createHotel();
      await createRoom(hotel.id);

      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.OK);
    });

    it('must return with status 200 and a body of hotels ', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithIsRemoteFalseAndIncludesHotel();
      const data: CreateTicketParams = {
        ticketTypeId: ticketType.id,
        enrollmentId: enrollment.id,
        status: TicketStatus.PAID,
      };
      await ticketRepository.createTicket(data);
      const hotel = await createHotel();
      await createRoom(hotel.id);

      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            name: expect.any(String),
            createdAt: expect.any(String),
            image: expect.any(String),
            updatedAt: expect.any(String),
            Rooms: expect.arrayContaining([
              expect.objectContaining({
                id: expect.any(Number),
                name: expect.any(String),
                capacity: expect.any(Number),
                hotelId: expect.any(Number),
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
              }),
            ]),
          }),
        ]),
      );
    });
  });
});

describe('GET /hotels/:hotelId', () => {
  it('should respond with status 401 if no token is given', async () => {
    const hotelId = 1;
    const response = await server.get(`/hotels/${hotelId}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if token is not valid', async () => {
    const token = faker.lorem.word();
    const hotelId = 1;
    const response = await server.get(`/hotels/${hotelId}`).set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    // cria um usuário anonimo
    const userWithoutSession = await createUser();
    const hotelId = 1;
    // cria um token
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    const response = await server.get(`/hotels/${hotelId}`).set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  describe('when token is valid', () => {
    it('must respond with 404 when token is valid but no enrollment, ticket and hotel created !', async () => {
      const hotelId = 1;
      const user = await createUser();
      const token = await generateValidToken(user);
      const response = await server.get(`/hotels/${hotelId}`).set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('must respond with 404 when token is valid with enrollment created but ticket and hotel no created !', async () => {
      const user = await createUser();
      const hotelId = 1;
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);
      const response = await server.get(`/hotels/${hotelId}`).set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('must respond with 404 when token is valid with enrollment and ticket created, but id hotel no exists !', async () => {
      const user = await createUser();
      const hotelId = 1;
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithIsRemoteFalseAndIncludesHotel();
      const data: CreateTicketParams = {
        ticketTypeId: ticketType.id,
        enrollmentId: enrollment.id,
        status: TicketStatus.PAID,
      };
      await ticketRepository.createTicket(data);
      const response = await server.get(`/hotels/${hotelId}`).set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should return with status 200 when enrollment, ticket and hotel id exists', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithIsRemoteFalseAndIncludesHotel();
      const data: CreateTicketParams = {
        ticketTypeId: ticketType.id,
        enrollmentId: enrollment.id,
        status: TicketStatus.PAID,
      };
      await ticketRepository.createTicket(data);
      const hotel = await createHotel();
      await createRoom(hotel.id);
      const response = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.OK);
    });

    it('should return with status 200 and a hotel body of existing id', async () => {
      const user = await createUser();

      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithIsRemoteFalseAndIncludesHotel();
      const data: CreateTicketParams = {
        ticketTypeId: ticketType.id,
        enrollmentId: enrollment.id,
        status: TicketStatus.PAID,
      };
      await ticketRepository.createTicket(data);
      const hotel = await createHotel();
      await createRoom(hotel.id);
      const response = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          name: expect.any(String),
          createdAt: expect.any(String),
          image: expect.any(String),
          updatedAt: expect.any(String),
          Rooms: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(Number),
              name: expect.any(String),
              capacity: expect.any(Number),
              hotelId: expect.any(Number),
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            }),
          ]),
        }),
      );
    });
  });
});
