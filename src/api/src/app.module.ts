import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigurationModule } from "./configs/configuration.module";
import { DatabaseModule } from "./database/database.module"
import { LinksModule } from "./modules"



@Module({
  imports: [ConfigurationModule, DatabaseModule, LinksModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
