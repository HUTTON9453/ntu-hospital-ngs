import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NGSBuilderDbModule } from 'src/database/ngs-builder/ngs-builder-db.module';
import { NgsConfig } from './config/ngs.config';
import { NGSController } from './controllers/ngs.controller';
import { NGSService } from './services/ngs.service';
@Module({
    imports: [
        ConfigModule.forFeature(NgsConfig),
        NGSBuilderDbModule
    ],
    controllers: [
        NGSController
    ],
    providers: [
        NGSService
    ]
  })
  export class NGSModule { }