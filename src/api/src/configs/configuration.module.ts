import { Module, Global } from '@nestjs/common';
import ConfigurationService from "./config.service"


@Global()
@Module({
    providers: [ConfigurationService],
    exports: [ConfigurationService]
})
export class ConfigurationModule {}