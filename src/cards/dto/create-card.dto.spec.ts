import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateCardDto } from './create-card.dto';

describe('CreateCardDto', () => {
  async function validateDto(payload: Record<string, unknown>) {
    return validate(plainToInstance(CreateCardDto, payload));
  }

  it('accepts a valid card creation payload', async () => {
    const errors = await validateDto({
      title: 'Implement login',
      description: 'Create JWT login endpoint.',
      position: 0,
    });

    expect(errors).toHaveLength(0);
  });

  it('accepts a payload with only title', async () => {
    const errors = await validateDto({
      title: 'Implement login',
    });

    expect(errors).toHaveLength(0);
  });

  it('rejects an empty title', async () => {
    const errors = await validateDto({
      title: '',
    });

    expect(errors.some((error) => error.property === 'title')).toBe(true);
  });

  it('rejects a non-integer position', async () => {
    const errors = await validateDto({
      title: 'Implement login',
      position: 'first',
    });

    expect(errors.some((error) => error.property === 'position')).toBe(true);
  });
});
