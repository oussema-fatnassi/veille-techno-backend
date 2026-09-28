import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateCardDto } from './update-card.dto';

describe('UpdateCardDto', () => {
  async function validateDto(payload: Record<string, unknown>) {
    return validate(plainToInstance(UpdateCardDto, payload));
  }

  it('accepts an empty update payload', async () => {
    const errors = await validateDto({});

    expect(errors).toHaveLength(0);
  });

  it('accepts a valid partial card update', async () => {
    const errors = await validateDto({
      title: 'Updated card',
      description: 'Updated description.',
      position: 2,
      listId: 3,
    });

    expect(errors).toHaveLength(0);
  });

  it('rejects an empty title when provided', async () => {
    const errors = await validateDto({
      title: '',
    });

    expect(errors.some((error) => error.property === 'title')).toBe(true);
  });

  it('rejects a non-integer position', async () => {
    const errors = await validateDto({
      position: 'second',
    });

    expect(errors.some((error) => error.property === 'position')).toBe(true);
  });

  it('rejects a non-integer listId', async () => {
    const errors = await validateDto({
      listId: 'target',
    });

    expect(errors.some((error) => error.property === 'listId')).toBe(true);
  });
});
