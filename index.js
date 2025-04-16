const express = require("express");
const pg = require("pg");
const path = require("path");
const server = express();

const client = new pg.Client(
    process.env.DATABASE_URL || "postgres://postgres:040324@localhost/acme_hr_db"
  );
  server.use(express.json())

  const init = async () => {
    await client.connect();

    const SQL =`
    DROP TABLE IF EXSISTS flavors;
    CREATE TABLE flavors(
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    is_favorite BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    );
    INSERT INTO flavors(name, is_favorite) VALUES ('vanilla', false);
    INSERT INTO flavors(name, is_favorite) VALUES ('cookies n cream', true);
    INSERT INTO flavors(name, is_favorite) VALUES ('chocolate', false);
    INSERT INTO flavors(name, is_favorite) VALUES ('smores', true);
    INSERT INTO flavors(name, is_favorite) VALUES ('rocky road, false);
    `;

    await client.query(SQL);
    console.log("data seeded");

    const port = process.env.PORT || 3000;
    server.listen(port, () => console.log('listening on port ${port}'));

    };

    server.get("/api/flavors", async (req, res, next) => {
        try {
            const SQL = `
            SELECT * from flavors:
            `;
    
            const response = await client.query(SQL);
    
            res.send(response.rows);
            } catch (error) {
                next(error);
            };
        });
    
    // init function invocation
    init();
    
    // static routes here (you only need these for deployment)
    server.use(express.static(path.join(__dirname, "../client/dist")));
    
    // server routes here
    server.get("/", (req, res) =>
        res.sendFile(path.join(__dirname, "../client/dist/index.html"))
        );