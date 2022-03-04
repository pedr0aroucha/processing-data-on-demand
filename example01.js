import mysql from "mysql";
import dotenv from "dotenv";
import { writeFileSync } from "fs";
import { promisify } from "util";

dotenv.config();

var connection = mysql.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME,
});

connection.connect();

const query = promisify(connection.query).bind(connection);

async function* list() {
	for (let offSet of [...Array(1_000_000).keys()]) {
		yield await query(
			`SELECT * FROM ${process.env.DB_TABLE} LIMIT 1 OFFSET ${offSet}`,
		);
	}
}

for await (let row of list()) {
	if (!row.length) break;
	writeFileSync("backup", String(Object.values(row[0]).join(";")) + "\n", {
		flag: "a",
	});
}

connection.end();
