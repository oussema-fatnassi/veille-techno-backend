import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { loginFixture } from './fixtures/auth.fixture';
import {
  TEST_PASSWORD,
  createOwnerAndOtherUserFixtures,
  createUserFixture,
} from './fixtures/users.fixture';
import {
  createListFixture,
  createOwnedListFixtures,
} from './fixtures/lists.fixture';
import {
  createCardFixture,
  createOwnedCardFixtures,
} from './fixtures/cards.fixture';
import { resetDatabase } from './helpers/database.helper';

describe('Kanban API fixtures (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    prisma = app.get(PrismaService);
    await app.init();
  });

  beforeEach(async () => {
    await resetDatabase(prisma);
  });

  afterAll(async () => {
    await resetDatabase(prisma);
    await app.close();
  });

  describe('auth fixtures', () => {
    it('registers a user without exposing the password', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'new.user@example.com',
          password: TEST_PASSWORD,
          name: 'New User',
        })
        .expect(201);

      expect(response.body).toMatchObject({
        email: 'new.user@example.com',
        name: 'New User',
        role: 'USER',
      });
      expect(response.body).not.toHaveProperty('password');
    });

    it('rejects duplicated emails', async () => {
      await createUserFixture(prisma, {
        email: 'duplicate@example.com',
      });

      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: TEST_PASSWORD,
          name: 'Duplicate User',
        })
        .expect(409);
    });

    it('returns an access token on login', async () => {
      const user = await createUserFixture(prisma, {
        email: 'login@example.com',
      });

      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: user.email, password: TEST_PASSWORD })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(typeof response.body.accessToken).toBe('string');
    });
  });

  describe('user ownership fixtures', () => {
    it('returns 401 when a protected route has no token', async () => {
      await request(app.getHttpServer()).get('/api/users/me').expect(401);
    });

    it('returns the current user without password', async () => {
      const user = await createUserFixture(prisma, {
        email: 'me@example.com',
        name: 'Current User',
      });
      const token = await loginFixture(app, user.email);

      const response = await request(app.getHttpServer())
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: user.id,
        email: user.email,
        name: 'Current User',
      });
      expect(response.body).not.toHaveProperty('password');
    });

    it('returns 403 when a user updates another user', async () => {
      const { owner, otherUser } =
        await createOwnerAndOtherUserFixtures(prisma);
      const otherUserToken = await loginFixture(app, otherUser.email);

      await request(app.getHttpServer())
        .patch(`/api/users/${owner.id}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({ name: 'Forbidden Update' })
        .expect(403);
    });
  });

  describe('list fixtures', () => {
    it('lists only the authenticated user lists', async () => {
      const { owner, otherUser } =
        await createOwnerAndOtherUserFixtures(prisma);
      const { ownerList } = await createOwnedListFixtures(
        prisma,
        owner.id,
        otherUser.id,
      );
      const token = await loginFixture(app, owner.email);

      const response = await request(app.getHttpServer())
        .get('/api/lists')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({
        id: ownerList.id,
        ownerId: owner.id,
      });
    });

    it('creates a list for the authenticated user', async () => {
      const owner = await createUserFixture(prisma, {
        email: 'list-owner@example.com',
      });
      const token = await loginFixture(app, owner.email);

      const response = await request(app.getHttpServer())
        .post('/api/lists')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'New List' })
        .expect(201);

      expect(response.body).toMatchObject({
        title: 'New List',
        position: 0,
        ownerId: owner.id,
      });
    });

    it('returns 400 when creating a list with invalid payload', async () => {
      const owner = await createUserFixture(prisma, {
        email: 'invalid-list-owner@example.com',
      });
      const token = await loginFixture(app, owner.email);

      await request(app.getHttpServer())
        .post('/api/lists')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: '' })
        .expect(400);
    });

    it('returns 403 when updating another user list', async () => {
      const { owner, otherUser } =
        await createOwnerAndOtherUserFixtures(prisma);
      const { ownerList } = await createOwnedListFixtures(
        prisma,
        owner.id,
        otherUser.id,
      );
      const otherUserToken = await loginFixture(app, otherUser.email);

      await request(app.getHttpServer())
        .patch(`/api/lists/${ownerList.id}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({ title: 'Forbidden List Update' })
        .expect(403);
    });

    it('returns 404 when updating a missing list', async () => {
      const owner = await createUserFixture(prisma, {
        email: 'missing-list-owner@example.com',
      });
      const token = await loginFixture(app, owner.email);

      await request(app.getHttpServer())
        .patch('/api/lists/999999')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Missing List' })
        .expect(404);
    });

    it('deletes a list and cascades its cards', async () => {
      const owner = await createUserFixture(prisma, {
        email: 'cascade-owner@example.com',
      });
      const list = await createListFixture(prisma, { ownerId: owner.id });
      const card = await createCardFixture(prisma, { listId: list.id });
      const token = await loginFixture(app, owner.email);

      await request(app.getHttpServer())
        .delete(`/api/lists/${list.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

      const deletedCard = await prisma.card.findUnique({
        where: { id: card.id },
      });
      expect(deletedCard).toBeNull();
    });
  });

  describe('card fixtures', () => {
    it('lists cards only when the authenticated user owns the list', async () => {
      const { owner, otherUser } =
        await createOwnerAndOtherUserFixtures(prisma);
      const { ownerList, otherUserList } = await createOwnedListFixtures(
        prisma,
        owner.id,
        otherUser.id,
      );
      const { ownerCard } = await createOwnedCardFixtures(
        prisma,
        ownerList.id,
        otherUserList.id,
      );
      const token = await loginFixture(app, owner.email);

      const response = await request(app.getHttpServer())
        .get(`/api/lists/${ownerList.id}/cards`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({
        id: ownerCard.id,
        listId: ownerList.id,
      });
    });

    it('returns 403 when listing cards from another user list', async () => {
      const { owner, otherUser } =
        await createOwnerAndOtherUserFixtures(prisma);
      const { ownerList } = await createOwnedListFixtures(
        prisma,
        owner.id,
        otherUser.id,
      );
      const otherUserToken = await loginFixture(app, otherUser.email);

      await request(app.getHttpServer())
        .get(`/api/lists/${ownerList.id}/cards`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(403);
    });

    it('creates a card in an owned list', async () => {
      const owner = await createUserFixture(prisma, {
        email: 'card-owner@example.com',
      });
      const list = await createListFixture(prisma, { ownerId: owner.id });
      const token = await loginFixture(app, owner.email);

      const response = await request(app.getHttpServer())
        .post(`/api/lists/${list.id}/cards`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'New Card',
          description: 'Created from e2e test',
        })
        .expect(201);

      expect(response.body).toMatchObject({
        title: 'New Card',
        description: 'Created from e2e test',
        position: 0,
        listId: list.id,
      });
    });

    it('returns 400 when creating a card with invalid payload', async () => {
      const owner = await createUserFixture(prisma, {
        email: 'invalid-card-owner@example.com',
      });
      const list = await createListFixture(prisma, { ownerId: owner.id });
      const token = await loginFixture(app, owner.email);

      await request(app.getHttpServer())
        .post(`/api/lists/${list.id}/cards`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: '' })
        .expect(400);
    });

    it('gets one owned card', async () => {
      const owner = await createUserFixture(prisma, {
        email: 'get-card-owner@example.com',
      });
      const list = await createListFixture(prisma, { ownerId: owner.id });
      const card = await createCardFixture(prisma, { listId: list.id });
      const token = await loginFixture(app, owner.email);

      const response = await request(app.getHttpServer())
        .get(`/api/cards/${card.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: card.id,
        listId: list.id,
      });
      expect(response.body).not.toHaveProperty('list');
    });

    it('returns 403 when getting another user card', async () => {
      const { owner, otherUser } =
        await createOwnerAndOtherUserFixtures(prisma);
      const { ownerList } = await createOwnedListFixtures(
        prisma,
        owner.id,
        otherUser.id,
      );
      const card = await createCardFixture(prisma, { listId: ownerList.id });
      const otherUserToken = await loginFixture(app, otherUser.email);

      await request(app.getHttpServer())
        .get(`/api/cards/${card.id}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(403);
    });

    it('updates and moves a card to another owned list', async () => {
      const owner = await createUserFixture(prisma, {
        email: 'move-card-owner@example.com',
      });
      const sourceList = await createListFixture(prisma, {
        ownerId: owner.id,
        title: 'Source',
        position: 0,
      });
      const targetList = await createListFixture(prisma, {
        ownerId: owner.id,
        title: 'Target',
        position: 1,
      });
      const card = await createCardFixture(prisma, { listId: sourceList.id });
      const token = await loginFixture(app, owner.email);

      const response = await request(app.getHttpServer())
        .patch(`/api/cards/${card.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Moved Card',
          listId: targetList.id,
        })
        .expect(200);

      expect(response.body).toMatchObject({
        id: card.id,
        title: 'Moved Card',
        listId: targetList.id,
      });
    });

    it('returns 403 when moving a card to another user list', async () => {
      const { owner, otherUser } =
        await createOwnerAndOtherUserFixtures(prisma);
      const { ownerList, otherUserList } = await createOwnedListFixtures(
        prisma,
        owner.id,
        otherUser.id,
      );
      const card = await createCardFixture(prisma, { listId: ownerList.id });
      const token = await loginFixture(app, owner.email);

      await request(app.getHttpServer())
        .patch(`/api/cards/${card.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ listId: otherUserList.id })
        .expect(403);
    });

    it('deletes an owned card', async () => {
      const owner = await createUserFixture(prisma, {
        email: 'delete-card-owner@example.com',
      });
      const list = await createListFixture(prisma, { ownerId: owner.id });
      const card = await createCardFixture(prisma, { listId: list.id });
      const token = await loginFixture(app, owner.email);

      await request(app.getHttpServer())
        .delete(`/api/cards/${card.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/api/cards/${card.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });
});
