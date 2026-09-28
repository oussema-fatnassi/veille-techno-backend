import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateListDto } from './create-list.dto';

describe('CreateListDto', () => {
  async function validateDto(payload: Record<string, unknown>) {
    return validate(plainToInstance(CreateListDto, payload));
  }

  it('accepts a valid list creation payload', async () => {
    const errors = await validateDto({
      title: 'Todo',
      position: 0,
    });

    expect(errors).toHaveLength(0);
  });

  it('accepts a payload without position', async () => {
    const errors = await validateDto({
      title: 'Todo',
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
      title: 'Todo',
      position: 'first',
    });

    expect(errors.some((error) => error.property === 'position')).toBe(true);
  });
});
