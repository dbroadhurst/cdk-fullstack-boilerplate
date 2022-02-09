import { IsNotEmpty, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateSettingDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ default: 'title' })
  titleText: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ default: 'description' })
  descriptionText: string
}
