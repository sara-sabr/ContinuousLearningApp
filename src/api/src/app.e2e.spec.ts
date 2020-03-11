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
import { DatabaseError } from './utils/errors';

/** TODO 
 * mocking the databaseService to throw Error to test unknown error response
 should replace this with something that doesn't break if I change the implementation
 * refactor to add heading using to describe instead of having to add which route I'm 
 testing each time. Seperate by HTTP methods 
 * take mocking out of individual tests 
*/


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
    describe("links routes", () => {

      it("/links/:id (GET)", async () => {
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

      it("Bad Request for invalid id parameter", async () => {
        let requestResponse = await request(app.getHttpServer()).get("/links/badid")
        expect(requestResponse.status).toBe(400)
        expect(requestResponse.body["message"]).toBe(
          "Bad request: id must be a number 1 or greater"
        )
      })

      it("Internal Error for DatabaseError /links/:id (GET)", async () => {
        let spiedOnQuery = jest.spyOn(db, "query")
        spiedOnQuery.mockImplementationOnce((...args) => { throw new Error("an error happened from the db")})

        let res = await request(app.getHttpServer()).get("/links/1")

        expect(res.status).toBe(500)
        expect(res.body["message"]).toBe(
          "A database error has occured: an error happened from the db"
        )


        spiedOnQuery.mockRestore()
      })

      it("Internal Error for Error /links/:id (GET)", async () => {
        let spiedOnReadLinkByID = jest.spyOn(databaseService, "readLinkById")

        spiedOnReadLinkByID.mockImplementationOnce( (...args) => { throw new Error("an error occured ")})

        let res = await request(app.getHttpServer()).get("/links/1")

        expect(res.status).toBe(500)
        expect(res.body["message"]).toBe(
          "An unknown error has occured"
        )
      })

      it("Not Found for non existant id /links/:id (GET)", async () => {
        let res = await request(app.getHttpServer()).get("/links/1")

        expect(res.status).toBe(404)
        expect(res.body["message"]).toBe(
          "Resource not found: No links found for id 1"
        )
      })

      it("/links (GET)", async () => {
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

        let requestResponse = await request(app.getHttpServer()).get("/links")

        expect(requestResponse.status).toBe(200)

        let requestBody = requestResponse.body

        expect(requestBody).toHaveLength(3)

        let rowArray  = [link1, link2, link3]

        for (let i = 0; i < rowArray.length; i ++){
          let row = rowArray[i].rows[0]
          let link = requestBody[i]
          expect(link).toMatchObject(
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

      it("returns an empty list for no data /links (GET)", async () => {
        let requestResponse = await request(app.getHttpServer()).get("/links")
        expect(requestResponse.status).toBe(200)
        expect(requestResponse.body).toMatchObject([])
      })

      it("Internal Error for DatabaseError /links (GET)", async () => {
        let spiedOnReadLinks = jest.spyOn(databaseService, "readLinks")
        spiedOnReadLinks.mockImplementationOnce((...args) => {
          throw new DatabaseError("a db error occured")
        })

        let requestResponse = await request(app.getHttpServer()).get("/links")
        expect(requestResponse.status).toBe(500)
        expect(requestResponse.body["message"]).toBe(
          "A database error has occured: a db error occured"
        )

        spiedOnReadLinks.mockRestore()
      })

      it("Internal Error for Error /links (GET)", async () => {
        let spiedOnReadLinks = jest.spyOn(databaseService, "readLinks")
        spiedOnReadLinks.mockImplementationOnce((...args) => {
          throw new Error("an error has occured")
        })

        let requestResponse = await request(app.getHttpServer()).get("/links")
        expect(requestResponse.status).toBe(500)
        expect(requestResponse.body["message"]).toBe(
          "An unknown error has occured"
        )
        spiedOnReadLinks.mockRestore()
      })

      it("order query parameter /links (GET)", async () => {
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

        let requestResponse = await request(app.getHttpServer()).get("/links?order=desc")

        expect(requestResponse.status).toBe(200)
        expect(requestResponse.body).toHaveLength(3)

        let rowArray = [link3 , link2, link1]
        let requestBody = requestResponse.body

        for (let i = 0; i < rowArray.length; i ++){
          let row = rowArray[i].rows[0]
          let link = requestBody[i]
          expect(link).toMatchObject(
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

      it("Bad Request for invalid option query parameter /links (GET)", async()=> {
        let requestResponse = await request(app.getHttpServer()).get("/links?order=invalidorder")
        expect(requestResponse.status).toBe(400)
        expect(requestResponse.body["message"]).toBe(
          "Bad request: order must have value of either asc or desc"
        )
      })

      it("offset query parameter /links (GET)", async () => {
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
        
        let requestResponse = await request(app.getHttpServer()).get("/links?offset=1")
        expect(requestResponse.status).toBe(200)
        expect(requestResponse.body).toHaveLength(2)

        let rowArray = [link2, link3]

        let requestBody = requestResponse.body
        for (let i = 0; i < rowArray.length; i ++){
          let row = rowArray[i].rows[0]
          let link = requestBody[i]
          expect(link).toMatchObject(
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

      it("Bad Request for invalid offset query parameter /links (GET)", async () => {
        let requestResponse = await request(app.getHttpServer()).get("/links?offset=invalidoffset")
        expect(requestResponse.status).toBe(400)
        expect(requestResponse.body["message"]).toBe(
          "Bad request: offset should be a number 0 or greater"
        )
      })
      
      it("limit query parameter /links (GET)", async () => {
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
      
        let requestResponse = await request(app.getHttpServer()).get("/links?limit=2")
        expect(requestResponse.status).toBe(200)
        expect(requestResponse.body).toHaveLength(2)
      
        let rowArray = [link1, link2]
      
        let requestBody = requestResponse.body
      
        for (let i = 0; i < rowArray.length; i ++){
          let row = rowArray[i].rows[0]
          let link = requestBody[i]
          expect(link).toMatchObject(
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
      
      it("Bad Request for invalid limit query parameter /links (GET)", async () => {
        let requestResponse = await request(app.getHttpServer()).get("/links?limit=invalidlimitoption")
        expect(requestResponse.status).toBe(400)
        expect(requestResponse.body["message"]).toBe(
          "Bad request: limit should be a number 0 or greater"
        )
      })

      it("order, limit and offset query parameters /links (GET)", async () => {
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

        let requestResponse = await request(app.getHttpServer()).get("/links?order=desc&limit=2&offset=1")

        expect(requestResponse.status).toBe(200)
        expect(requestResponse.body).toHaveLength(2)
        
        let rowArray = [link2, link1]
        let requestBody = requestResponse.body
      
        for (let i = 0; i < rowArray.length; i ++){
          let row = rowArray[i].rows[0]
          let link = requestBody[i]
          expect(link).toMatchObject(
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

      it.only("/links (POST)", async () => {
        let requestResponse = await request(app.getHttpServer()).post(
          "/links"
        ).send(
          {
            url: "thisisaurl.com",
            language: "en",
            title: "this is a title",
            description: "This is description for a url",
            imageLink: "thisisaurl.com/something.png",

          }
        )

        expect(requestResponse.status).toBe(201)

        let dbRow = await db.query(
          "SELECT * FROM links"
        )

        expect(dbRow.rowCount).toBe(1)

        expect(dbRow.rows[0].id).toBe(1)
        expect(dbRow.rows[0].url).toBe("thisisaurl.com")
        expect(dbRow.rows[0].title).toBe("this is a title")
        expect(dbRow.rows[0].language).toBe("en")
        expect(dbRow.rows[0].image_link).toBe("thisisaurl.com/something.png")
        expect(dbRow.rows[0].description).toBe("This is description for a url")
      })
    })

    afterAll(async () => {    
      await db.destroyDatabaseSchema()
      await db.endPool()
      app.close()
    })
  })
});
