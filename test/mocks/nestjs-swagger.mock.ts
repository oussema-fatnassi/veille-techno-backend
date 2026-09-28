/**
 * Replaces Swagger decorators with no-ops in Jest unit tests to avoid ESM loading issues.
 * These tests check application behavior, not generated OpenAPI metadata.
 */

const noopDecorator = () => () => undefined;

export const ApiBearerAuth = noopDecorator;
export const ApiBody = noopDecorator;
export const ApiExcludeController = noopDecorator;
export const ApiOperation = noopDecorator;
export const ApiParam = noopDecorator;
export const ApiProperty = noopDecorator;
export const ApiPropertyOptional = noopDecorator;
export const ApiResponse = noopDecorator;
export const ApiTags = noopDecorator;
