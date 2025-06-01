import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer()) // use csrf header
      .get('/events/public')
      .set('x-csrf-protection', '1')
      .expect(200) // a list of shape {id, startDate, endDate, title}
      .expect((res) => {
        expect(res.body[0]).toHaveProperty('id');
        expect(res.body[0]).toHaveProperty('startDate');
        expect(res.body[0]).toHaveProperty('endDate');
        expect(res.body[0]).toHaveProperty('title');
      });
  });
});
