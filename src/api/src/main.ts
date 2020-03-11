import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger"
import ConfigurationService from "./configs/config.service"
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const applicationConfigs = app.get<ConfigurationService>(ConfigurationService).getApplicationConfigs()
  
  app.setGlobalPrefix(applicationConfigs.applicationPrefix)
  const options = new DocumentBuilder()
  .setTitle("ContinuousLearningApp API")
  .setDescription("Documentation for the continuous learning app's ( terrible at names I know ) API. " +
   "Also some terrible jokes because I have an ego and I think I'm funny"
  )
  .setVersion("1.0")
  .setLicense("Open Government License", "https://open.canada.ca/en/open-government-licence-canada")
  .build()
  
  const document = SwaggerModule.createDocument(app, options)
  SwaggerModule.setup("documentation", app, document)
  
  await app.listen(applicationConfigs.applicationPort);
}
bootstrap();
