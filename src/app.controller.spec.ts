import { AppController } from './app.controller';
import type { AppService } from './app.service';

jest.mock('@nestjs/common', () => ({
  Controller: () => () => undefined,
  Get: () => () => undefined,
  Injectable: () => () => undefined,
}));

describe('AppController', () => {
  it('delegates root response to AppService', () => {
    const appServiceMock = {
      getHello: jest.fn().mockReturnValue('Hello World!'),
    };
    const controller = new AppController(
      appServiceMock as unknown as AppService,
    );

    const result = controller.getHello();

    expect(appServiceMock.getHello).toHaveBeenCalled();
    expect(result).toBe('Hello World!');
  });
});
