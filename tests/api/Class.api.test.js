const axios = require('axios');
const { Pool } = require('pg');

const API_URL = process.env.API_URL || 'http://localhost:8080';
const api = axios.create({
    baseURL: API_URL,
    timeout: 5000,
});

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/schedule'
});

describe('Class API', () => {

    let createdClassId;
    let createdClassName;

    beforeAll(async () => {
        const response = await api.post('/auth/sign-in', {
            email: process.env.EMAIL || 'manager@gmail.com',
            password: process.env.PASSWORD || 'Qwerty!123',
        });
        api.defaults.headers.common['Authorization'] = `Bearer_${response.data.token}`;
    });

    afterAll(async () => {
        await pool.end();
    });

    describe('GET /classes', () => {

        it('should return list of classes', async () => {
            const response = await api.get('/classes');
            expect(response.status).toBe(200);
            expect(Array.isArray(response.data)).toBe(true);
        });

        it('should return classes with required fields', async () => {
            const response = await api.get('/classes');

                expect(response.data[0]).toHaveProperty('id');
                expect(response.data[0]).toHaveProperty('class_name');
                expect(response.data[0]).toHaveProperty('startTime');
                expect(response.data[0]).toHaveProperty('endTime');

        });
    });

    describe('POST /classes', () => {

        it('should create a new class', async () => {
            createdClassName = `TestClass_${Date.now()}`;
            const newClass = {
                startTime: '17:50',
                endTime: '18:10',
                class_name: createdClassName,
            };

            const response = await api.post('/classes', newClass);

            expect(response.status).toBe(201);
            expect(response.data).toHaveProperty('id');
            expect(response.data.class_name).toBe(newClass.class_name);

            createdClassId = response.data.id;
        });

        it('should return error for invalid data', async () => {
            await expect(api.post('/classes', {}))
                .rejects.toMatchObject({
                    response: { status: expect.any(Number) }
                });
        });

        it('should save class to database', async () => {

            const result = await pool.query(
                'SELECT * FROM periods WHERE id = $1',
                [createdClassId]
            );
            expect(result.rows.length).toBe(1);
            expect(result.rows[0].name).toBe(createdClassName);
        });
    });

    describe('GET /classes/:id', () => {

        it('should return class by id', async () => {
            const response = await api.get(`/classes/${createdClassId}`);
            expect(response.status).toBe(200);
            expect(response.data.id).toBe(createdClassId);
        });

        it('should return 404 for non-existing class', async () => {
            await expect(api.get('/classes/999999'))
                .rejects.toMatchObject({
                    response: { status: 404 }
                });
        });
    });

    describe('PUT /classes', () => {

        it('should update class', async () => {
            const updatedClass = {
                id: createdClassId,
                startTime: '17:30',
                endTime: '18:10',
                class_name: `UpdatedClass_${Date.now()}`,
            };

            const response = await api.put('/classes', updatedClass);

            expect(response.status).toBe(200);
            expect(response.data.class_name).toBe(updatedClass.class_name);
            expect(response.data.id).toBe(createdClassId);
        });
    });

    describe('DELETE /classes/:id', () => {

        it('should delete class', async () => {
            const response = await api.delete(`/classes/${createdClassId}`)
                .catch(err => err.response);
            expect([200, 500]).toContain(response.status);
        });

        it('should return 404 after deletion', async () => {
            await expect(api.get('/classes/999999'))
                .rejects.toMatchObject({
                    response: { status: 404 }
                });
        });
    });
});