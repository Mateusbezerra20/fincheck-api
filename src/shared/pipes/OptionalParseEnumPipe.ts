import { ParseEnumPipe, ArgumentMetadata } from '@nestjs/common';

export class OptionalParseEnumPipe extends ParseEnumPipe {
  transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    if (typeof value === 'undefined') {
      return undefined;
    }

    return super.transform(value, metadata);
  }
}
