import { IsArray, ValidateNested, ArrayNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { SendMailDto } from './send-mal.dto';

export class SendBulkMailDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => SendMailDto)
  emails: SendMailDto[];
}
