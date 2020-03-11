import { Module } from '@nestjs/common';
import { ConfigurationModule } from "./configs/configuration.module";
import { DatabaseModule } from "./database/database.module"
import { LinksModule } from "./modules"



@Module({
  imports: [ConfigurationModule, DatabaseModule, LinksModule]
})
export class AppModule {}
