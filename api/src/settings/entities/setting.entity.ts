import { ApiProperty } from '@nestjs/swagger'
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class Setting {
  @PrimaryGeneratedColumn()
  id: number

  @ApiProperty()
  @Column({ default: 'default title' })
  titleText: string

  @ApiProperty()
  @Column({ default: 'default description' })
  descriptionText: string
}
