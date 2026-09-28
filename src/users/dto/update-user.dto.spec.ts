import { Role } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateUserDto } from './update-user.dto';

describe('UpdateUserDto', () => {
  async function validateDto(payload: Record<string, unknown>) {
    return validate(plainToInstance(UpdateUserDto, payload));
  }

  it('accepts an empty update payload', async () => {
    const errors = await validateDto({});

    expect(errors).toHaveLength(0);
  });

  it('accepts valid partial user updates', async () => {
    const errors = await validateDto({
      email: 'updated.user@test.com',
      name: 'Updated User',
      password: 'Test1234.',
      role: Role.ADMIN,
    });

    expect(errors).toHaveLength(0);
  });

  it('rejects an invalid email', async () => {
    const errors = await validateDto({
      email: 'invalid-email',
    });

    expect(errors.some((error) => error.property === 'email')).toBe(true);
  });

  it('rejects a weak password', async () => {
    const errors = await validateDto({
      password: 'password',
    });

    expect(errors.some((error) => error.property === 'password')).toBe(true);
  });

  it('rejects an invalid role', async () => {
    const errors = await validateDto({
      role: 'SUPER_ADMIN',
    });

    expect(errors.some((error) => error.property === 'role')).toBe(true);
  });
});
