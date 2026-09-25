import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginDto } from './login.dto';

describe('LoginDto', () => {
  async function validateDto(payload: Record<string, unknown>) {
    return validate(plainToInstance(LoginDto, payload));
  }

  it('accepts a valid login payload', async () => {
    const errors = await validateDto({
      email: 'user@example.com',
      password: 'Password1',
    });

    expect(errors).toHaveLength(0);
  });

  it('rejects an invalid email', async () => {
    const errors = await validateDto({
      email: 'not-an-email',
      password: 'Password1',
    });

    expect(errors.some((error) => error.property === 'email')).toBe(true);
  });

  it('rejects a missing password', async () => {
    const errors = await validateDto({
      email: 'user@example.com',
    });

    expect(errors.some((error) => error.property === 'password')).toBe(true);
  });
});
