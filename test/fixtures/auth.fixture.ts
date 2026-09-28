/**
 * Obtains a real JWT through the login endpoint for authenticated e2e requests.
 */

import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TEST_PASSWORD } from './users.fixture';

export async function loginFixture(
  app: INestApplication,
  email: string,
  password = TEST_PASSWORD,
): Promise<string> {
  const response = await request(app.getHttpServer())
    .post('/api/auth/login')
    .send({ email, password })
    .expect(200);

  return response.body.accessToken as string;
}
