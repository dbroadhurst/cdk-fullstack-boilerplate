import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreateSettingDto } from './dto/create-setting.dto'
import { UpdateSettingDto } from './dto/update-setting.dto'
import { Setting } from './entities/setting.entity'

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting) private settingsRepo: Repository<Setting>,
  ) {}

  create(createSettingDto: CreateSettingDto) {
    const newSettings = this.settingsRepo.create(createSettingDto as any)
    return this.settingsRepo.save(newSettings)
  }

  findAll() {
    return this.settingsRepo.find()
  }

  findOne(id: number) {
    return this.settingsRepo.findOneOrFail(id)
  }

  update(id: number, updateSettingDto: UpdateSettingDto) {
    return this.settingsRepo.update(id, updateSettingDto as any)
  }

  remove(id: number) {
    return this.settingsRepo.delete(id)
  }
}
