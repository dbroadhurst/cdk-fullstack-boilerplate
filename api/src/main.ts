import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import helmet from 'helmet'
import { AppModule } from './app.module'

import 'dotenv/config'

const PORT = process.env.PORT || 8000

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.use(helmet())
  app.enableCors()
  app.useGlobalPipes(new ValidationPipe({ transform: true }))

  const config = new DocumentBuilder()
    .setTitle('CDK Full Stack')
    .setDescription('CDK Full Stack API')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('swagger', app, document)

  await app.listen(PORT)
}
bootstrap()
