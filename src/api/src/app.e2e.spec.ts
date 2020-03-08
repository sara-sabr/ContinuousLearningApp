import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from './app.module';
import DatabaseService from "./database/database.service"
import { DatabaseOperations } from "./database/db"
import { INestApplication } from '@nestjs/common';
import ConfigurationService from "./configs/config.service"
import * as dotenv from "dotenv"
import * as path from "path"
import { mocked } from 'ts-jest/utils';

dotenv.config()
jest.mock("../src/configs/config.service")
const mockedConfigurationService = mocked(ConfigurationService, true)

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let databaseService: DatabaseService
  let db: DatabaseOperations
  const ddl_path = path.join(__dirname.replace(__filename, ""), "database", "ddl")
  const  ddl : string = DatabaseOperations.load_ddl(ddl_path)
  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    databaseService = moduleFixture.get<DatabaseService>(DatabaseService)
    db = databaseService.getDb()
    await app.init();
  });

  beforeEach(async () => {
    await db.destroyDatabaseSchema()
    try{
      await db.createDatabaseSchema(ddl)
    }catch(err){
      console.log("Failed to initiate test: Could not create schema")
      throw err
    }
  })

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  afterEach( async () => {
    await db.destroyDatabaseSchema()
    await db.endPool()
  })
});
