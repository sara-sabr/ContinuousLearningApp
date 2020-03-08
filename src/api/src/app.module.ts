import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigurationModule } from "./configs/configuration.module";
import { DatabaseModule } from "./database/database.module"



@Module({
  imports: [ConfigurationModule, DatabaseModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
