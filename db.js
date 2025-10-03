const { drizzle } = require("drizzle-orm/node-postgres");
const { Pool } = require("pg");
const { pgTable, serial, text, timestamp, integer } = require("drizzle-orm/pg-core");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

const studentDetails = pgTable("student_details", {
    id: serial("id").primaryKey(),
    username: text("username"),
    subject: text("subject"),
    totalHours: text("total_hours"),
    credits: text("credits"),
    ieCount: integer('ie_count'),
    qbCount: integer('qb_count'),
    attendance: text('attendance'),
    createdAt: timestamp("created_at").defaultNow(),
});



module.exports = {
    db,
    studentDetails
}