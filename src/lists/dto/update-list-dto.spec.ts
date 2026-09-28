import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateListDto } from './update-list-dto';

describe('UpdateListDto', () => {
  async function validateDto(payload: Record<string, unknown>) {
    return validate(plainToInstance(UpdateListDto, payload));
  }

  it('accepts an empty update payload', async () => {
    const errors = await validateDto({});

    expect(errors).toHaveLength(0);
  });

  it('accepts a valid partial list update', async () => {
    const errors = await validateDto({
      title: 'Done',
      position: 1,
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
});
