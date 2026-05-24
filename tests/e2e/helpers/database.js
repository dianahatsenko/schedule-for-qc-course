const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL ||
        'postgres://postgres:postgres@localhost:5432/schedule'
});

async function getRoomTypeByName(name) {
    const result = await pool.query(
        'SELECT * FROM room_types WHERE description = $1',
        [name]
    );
    return result.rows[0] || null;
}

async function deleteRoomTypeByName(name) {
    await pool.query(
        'DELETE FROM room_types WHERE description = $1',
        [name]
    );
}

async function closePool() {
    await pool.end();
}

module.exports = {
    getRoomTypeByName,
    deleteRoomTypeByName,
    closePool,
};