/**
 * Defines the request identity shared by the JWT guard, decorator and services.
 * Uses Prisma's Role enum to keep role values aligned with the database.
 */

import { Role } from '@prisma/client';

export type AuthenticatedUser = {
  id: number;
  email: string;
  role: Role;
};
