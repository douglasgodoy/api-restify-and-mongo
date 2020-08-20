import 'jest';
import * as request from 'supertest';
import { Server } from '../server/Server';
import { environment } from '../common/environment';
import { usersRouter } from './users.router';
import { User } from './users.model';
let address: string;
let server: Server;
beforeAll(() => {
    environment.db.url = process.env.DB_URL || 'mongodb://localhost/meat-api-test-db'
    environment.server.port = process.env.SERVER_PORT || 3001
    address = `http://localhost:${environment.server.port}`
    server = new Server()
    server.bootstrap([usersRouter])
        .then(() => User.remove({}).exec())
        .catch(console.error)
});

test('get /users', () => {
    return request(address)
        .get('/users')
        .then(res => {
            expect(res.status).toBe(200);
            expect(res.body.items).toBeInstanceOf(Array)
        }).catch(fail)
});

test('post /users', () => {
    return request(address)
        .post('/users')
        .send({
            name: "Douglas Testando com Jest",
            email: 'douglasgodoy1998@gmail.com',
            password: '123456',
            cpf: '51067052070'
        })
        .then(res => {
            expect(res.status).toBe(200);
            expect(res.body._id).toBeDefined()
            expect(res.body.name).toBe('Douglas Testando com Jest')
            expect(res.body.email).toBe('douglasgodoy1998@gmail.com')
            expect(res.body.cpf).toBe('51067052070')
            expect(res.body.password).toBeUndefined()
        }).catch(fail)
});

test('get /users/aaaaa - not found', () => {
    return request(address)
        .get('/users/aaaaa')
        .then(res => {
            expect(res.status).toBe(404);
        }).catch(fail)
});

test('patch /users/:id', () => {
    return request(address)
        .post('/users')
        .send({
            name: "Douglas Testando com PATCH",
            email: 'DOUGLASPATCH@gmail.com',
            password: '123456',
        })
        .then(res => {
            request(address)
                .patch(`/users/${res.body._id}`)
                .send({
                    name: 'usuario alterado com patch'
                })
                .then(res => {
                    expect(res.status).toBe(200);
                    expect(res.body._id).toBeDefined()
                    expect(res.body.name).toBe('usuario alterado com patch')
                    expect(res.body.email).toBe('DOUGLASPATCH@gmail.com')
                    expect(res.body.password).toBeUndefined()
                }).catch(console.error)
        }).catch(fail)
})

afterAll(async () => await server.shutdown())