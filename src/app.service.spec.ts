import { AppService } from './app.service';

jest.mock('@nestjs/common', () => ({
  Injectable: () => () => undefined,
}));

describe('AppService', () => {
  it('returns the default health message', () => {
    const service = new AppService();

    expect(service.getHello()).toBe('Hello World!');
  });
});
