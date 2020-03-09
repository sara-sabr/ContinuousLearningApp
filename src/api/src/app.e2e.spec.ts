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
import { syncBuiltinESMExports } from 'module';

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
    await app.init();
    databaseService = app.get<DatabaseService>(DatabaseService)
    db = databaseService.getDb()
  });

  describe("route tests", () => {
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
  
    it("/link/:id (GET)", async () => {
      let link1 = await db.query(
        "INSERT INTO links (url, title, language, description, image_link) " +
        "VALUES ('https://test1.com', 'test1', 'en', 'This is a testing site', 'https://test1.com/png') " +
        "RETURNING *"
      )
  
      let link2 = await db.query(
        "INSERT INTO links (url, title, language, description, image_link) " +
        "VALUES ('https://test2.com', 'test2', 'fr', 'This is a testing site', 'https://test2.com/png') " +
        "RETURNING *"
      )
  
      let link3 = await db.query(
        "INSERT INTO links (url, title, language, description, image_link) " +
        "VALUES ('https://test3.com', 'test3', 'fr', 'This is a testing site', 'https://test3.com/png') " +
        "RETURNING *"
      )
  
      let request1 = await request(app.getHttpServer()).get("/links/1")
      let request2 = await request(app.getHttpServer()).get("/links/2")
      let request3 = await request(app.getHttpServer()).get("/links/3")
  
      // let request2Response = await request2
      // let request3Response = await request3

      expect(request1.status).toBe(200)
      expect(request2.status).toBe(200)
      expect(request3.status).toBe(200)

      let rowArray = [link1, link2, link3]
      let requestArray = [request1, request2, request3]
      
      for (let i = 0; i < rowArray.length; i ++){
        let row = rowArray[i].rows[0]
        let request = requestArray[i]
        expect(request.body).toMatchObject(
          {
            id: row["id"],
            url: row["url"],
            language: row["language"],
            title: row["title"],
            description: row["description"],
            imageLink: row["image_link"],
            createdOn: row["created_on"].toISOString(),
            updatedOn: row["updated_on"]
          }
        )

      }
    })
  
    afterAll( async () => {
      await db.destroyDatabaseSchema()
      await db.endPool()
      app.close()
    })
  })
});
