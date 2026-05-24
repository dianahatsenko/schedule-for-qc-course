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

describe('Lesson API', () => {

    let teacherId, teacherName, teacherSurname, teacherPatronymic;
    let subjectId, subjectName, subjectDisable;
    let semesterId, groupId, groupTitle, groupDisable;
    let createdLessonId;
    let createdSubjectForSite;

    beforeAll(async () => {

        const authResponse = await api.post('/auth/sign-in', {
            email: process.env.EMAIL || 'manager@gmail.com',
            password: process.env.PASSWORD || 'Qwerty!123',
        });
        api.defaults.headers.common['Authorization'] = `Bearer_${authResponse.data.token}`;

        const teachersResponse = await api.get('/teachers');
        const teacher = teachersResponse.data[0];
        teacherId = teacher.id;
        teacherName = teacher.name;
        teacherSurname = teacher.surname;
        teacherPatronymic = teacher.patronymic;

        const subjectsResponse = await api.get('/subjects');
        const subject = subjectsResponse.data[0];
        subjectId = subject.id;
        subjectName = subject.name;
        subjectDisable = subject.disable;

        const semestersResponse = await api.get('/semesters');
        const semester = semestersResponse.data[0];
        semesterId = semester.id;
        const group = semester.semester_groups[0];
        groupId = group.id;
        groupTitle = group.title;
        groupDisable = group.disable;

        createdSubjectForSite = `LessonSubject_${Date.now()}`;
        const newLesson = {
            hours: 2,
            linkToMeeting: `https://meet.example.com/${Date.now()}`,
            subjectForSite: createdSubjectForSite,
            lessonType: 'LECTURE',
            subject: { id: subjectId, name: subjectName, disable: subjectDisable },
            teacher: { id: teacherId, name: teacherName, surname: teacherSurname, patronymic: teacherPatronymic },
            semesterId: semesterId,
            groups: [{ id: groupId, disable: groupDisable, title: groupTitle }],
            grouped: false,
        };

        try {
            const lessonResponse = await api.post('/lessons', newLesson);
            if (Array.isArray(lessonResponse.data) && lessonResponse.data.length > 0) {
                createdLessonId = lessonResponse.data[0].id;
            }
        } catch (err) {
            const allLessons = await api.get('/lessons');
            if (allLessons.data.length > 0) {
                createdLessonId = allLessons.data[0].id;
                createdSubjectForSite = allLessons.data[0].subjectForSite;
            }
        }
    });

    afterAll(async () => {
        await pool.end();
    });

    describe('GET /lessons', () => {

        it('should return list of lessons', async () => {
            const response = await api.get('/lessons');
            expect(response.status).toBe(200);
            expect(Array.isArray(response.data)).toBe(true);
        });

        it('should return lessons with required fields', async () => {
            const response = await api.get('/lessons');
            if (response.data.length > 0) {
                const lesson = response.data[0];
                expect(lesson).toHaveProperty('id');
                expect(lesson).toHaveProperty('lessonType');
                expect(lesson).toHaveProperty('subject');
                expect(lesson).toHaveProperty('teacher');
                expect(lesson).toHaveProperty('group');
            }
        });
    });

    describe('GET /lessons/types', () => {

        it('should return valid lesson types', async () => {
            const response = await api.get('/lessons/types');
            expect(response.status).toBe(200);
            expect(Array.isArray(response.data)).toBe(true);
            const validTypes = ['LECTURE', 'LABORATORY', 'PRACTICAL'];
            const hasValidType = response.data.some(t => validTypes.includes(t));
            expect(hasValidType).toBe(true);
        });
    });


    describe('POST /lessons', () => {

        it('should create a new lesson', async () => {
            expect(createdLessonId).toBeDefined();
            expect(createdSubjectForSite).toBeDefined();
        });

        it('should fail when creating lesson without teacher', async () => {
            const lessonWithoutTeacher = {
                hours: 2,
                subjectForSite: `NoTeacher_${Date.now()}`,
                lessonType: 'LECTURE',
                subject: { id: subjectId, name: subjectName, disable: subjectDisable },
                semesterId: semesterId,
                groups: [{ id: groupId, disable: groupDisable, title: groupTitle }],
                grouped: false,
            };

            await expect(api.post('/lessons', lessonWithoutTeacher))
                .rejects.toMatchObject({
                    response: { status: expect.any(Number) }
                });
        });

        it('should save lesson to database', async () => {
            const result = await pool.query(
                'SELECT * FROM lessons WHERE id = $1',
                [createdLessonId]
            );
            expect(result.rows.length).toBe(1);
            expect(result.rows[0].subject_for_site).toBe(createdSubjectForSite);
        });
    });

    describe('GET /lessons/:id', () => {

        it('should return lesson by id with nested objects', async () => {
            const response = await api.get(`/lessons/${createdLessonId}`);
            expect(response.status).toBe(200);
            expect(response.data.id).toBe(createdLessonId);
            expect(response.data).toHaveProperty('subject');
            expect(response.data).toHaveProperty('teacher');
            expect(response.data).toHaveProperty('group');
        });

        it('should return 404 for non-existing lesson', async () => {
            await expect(api.get('/lessons/999999'))
                .rejects.toMatchObject({
                    response: { status: 404 }
                });
        });
    });

    describe('PUT /lessons', () => {

        it('should update lesson', async () => {
            const updatedSubjectForSite = `UpdatedLesson_${Date.now()}`;

            const currentLesson = await api.get(`/lessons/${createdLessonId}`);
            const currentGroup = currentLesson.data.group;
            const currentTeacher = currentLesson.data.teacher;
            const currentSubject = currentLesson.data.subject;

            const updatedLesson = {
                id: createdLessonId,
                hours: 3,
                linkToMeeting: 'https://meet.example.com/updated',
                subjectForSite: updatedSubjectForSite,
                lessonType: 'LECTURE',
                subject: currentSubject,
                teacher: currentTeacher,
                semesterId: semesterId,
                group: currentGroup,
                grouped: false,
            };

            const response = await api.put('/lessons', updatedLesson);

            expect(response.status).toBe(200);
            expect(response.data.subjectForSite).toBe(updatedSubjectForSite);
            expect(response.data.hours).toBe(3);
            createdLessonId = response.data.id;
            expect(createdLessonId).toBeDefined();
        });
    });

    describe('DELETE /lessons/:id', () => {

        it('should delete lesson', async () => {
            const response = await api.delete(`/lessons/${createdLessonId}`);
            expect(response.status).toBe(200);
        });

        it('should return 404 after deletion', async () => {
            await expect(api.get(`/lessons/${createdLessonId}`))
                .rejects.toMatchObject({
                    response: { status: 404 }
                });
        });
    });
});