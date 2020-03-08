import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';
import ConfigurationService from "./configs/config.service"
import * as dotenv from "dotenv"
import { mocked } from 'ts-jest/utils';

dotenv.config()
jest.mock("../src/configs/config.service")
const mockedConfigurationService = mocked(ConfigurationService, true)

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
