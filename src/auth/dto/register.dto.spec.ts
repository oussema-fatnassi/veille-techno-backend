import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RegisterDto } from './register.dto';

describe('RegisterDto', () => {
  async function validateDto(payload: Record<string, unknown>) {
    return validate(plainToInstance(RegisterDto, payload));
  }

  it('accepts a valid registration payload', async () => {
    const errors = await validateDto({
      email: 'user@example.com',
      password: 'Password1',
      name: 'Test',
    });

    expect(errors).toHaveLength(0);
  });

  it('rejects an invalid email', async () => {
    const errors = await validateDto({
      email: 'not-an-email',
      password: 'Password1',
      name: 'Test',
    });

    expect(errors.some((error) => error.property === 'email')).toBe(true);
  });

  it('rejects a weak password', async () => {
    const errors = await validateDto({
      email: 'user@example.com',
      password: 'password',
      name: 'Test',
    });

    expect(errors.some((error) => error.property === 'password')).toBe(true);
  });

  it('rejects a missing name', async () => {
    const errors = await validateDto({
      email: 'user@example.com',
      password: 'Password1',
    });

    expect(errors.some((error) => error.property === 'name')).toBe(true);
  });
});
