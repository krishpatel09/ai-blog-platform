import {
    ArgumentMetadata,
    BadRequestException,
    Injectable,
    PipeTransform,
  } from '@nestjs/common';
  import { plainToInstance } from 'class-transformer';
  import { validate } from 'class-validator';
  
  @Injectable()
  export class ValidationPipe implements PipeTransform {
    async transform(value: any, metadata: ArgumentMetadata) {
      const { metatype } = metadata;
  
      // If no DTO type, skip validation
      if (!metatype || !this.toValidate(metatype)) {
        return value;
      }
  
      // Convert plain object to DTO class
      const object = plainToInstance(metatype, value);
  
      // Validate DTO
      const errors = await validate(object, {
        whitelist: true,
        forbidNonWhitelisted: true,
      });
  
      if (errors.length > 0) {
        const messages = errors.map((error) =>
          Object.values(error.constraints || {}),
        );
  
        throw new BadRequestException({
          message: 'Validation failed',
          errors: messages.flat(),
        });
      }
  
      return object;
    }
  
    private toValidate(metatype: Function): boolean {
      const types: Function[] = [String, Boolean, Number, Array, Object];
      return !types.includes(metatype);
    }
  }
  