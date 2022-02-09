import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Setting } from './settings/entities/setting.entity'
import { SettingsModule } from './settings/settings.module'
import { HealthController } from './health/health.controller'

let dbHost = process.env.DB_HOST
let dbUser = process.env.DB_USER
let dbPassword = process.env.DB_PASSWORD

if (process.env.DB_INFO) {
  // This info comes from the AWS secrets manager
  const info = JSON.parse(process.env.DB_INFO)
  dbHost = info.host
  dbUser = info.username
  dbPassword = info.password
}

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: dbHost,
      port: 5432,
      username: dbUser,
      password: dbPassword,
      database: 'cdkfullstack',
      entities: [Setting],
      logging: ['info'],
      synchronize: true,
    }),
    SettingsModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
