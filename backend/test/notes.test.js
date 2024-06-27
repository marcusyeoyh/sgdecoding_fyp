const request = require("supertest");
const mongodb = require('./mongoDB');
const app = require("../app");
const { beforeEach } = require("node:test");

beforeAll(() => {
    mongodb.connect();
}, 10000);

afterAll(() => {
    mongodb.disconnect();
})


describe('Create Notes', () => {
    beforeEach(() => {
        jest.setTimeout(10000);
      });
      
    it('should create note and return status 200', async() => {

        const response = await request(app).post('/notes/new').send({
            userEmail: 'user@example.com',
            title: 'test title'
        }, 70000);
        expect(response.statusCode).toBe(200);   
    })
})

describe('Create Notes', () => {
    it('should create note and return status 200', async() => {

        const response = await request(app).post('/notes/newNote').send({
            userEmail: 'user@example.com',
            title: 'test title',
            text: "This is test's body"
        });
        expect(response.statusCode).toBe(200);   
    })
})

describe('Get Existing Users Notes', () => {
    it('should get users notes and return status 200', async() => {
        //arrange
        const params = { userEmail: 'user@example.com' };

        //act
        const response = await request(app).post('/notes').send(params);

        //assert
        expect(response.statusCode).toBe(200);   
    })
})

describe('Get Non Existent Users Notes', () => {
    it('should get users notes and return status 200', async() => {

        const response = await request(app).post('/notes').send({
            userEmail: 'test@example.com'
        });

        expect(response.body).toStrictEqual([]);
        expect(response.statusCode).toBe(200);   
    })
})


describe('Get a non existent note', () => {
    it('should get one user notes and return status 200', async() => {

        const response = await request(app).post('/notes/oneNote').send({
            id: '1234'
        });

        expect(response.body).toBe(null);
        expect(response.statusCode).toBe(200);   
    })
})

describe('Update One User Notes', () => {
    it('should update users note return status 200', async() => {

        const response = await request(app).post('/notes/update').send({
            id: '1234',
            text: 'hello'
        });
        expect(response.statusCode).toBe(200);   
    })
})

describe('Update Notes Title', () => {
    it('should update user notes title return status 200', async() => {

        const response = await request(app).post('/notes/update').send({
            id: '1234',
            title: 'hello'
        });
        expect(response.statusCode).toBe(200);   
    })
})

describe('Delete non existing notes', () => {
    it('should not delete the note and return 404', async() => {

        const response = await request(app).post('/notes/delete').send({
            _id: '1234'
        });
        expect(response.statusCode).toBe(404);   
    })
})