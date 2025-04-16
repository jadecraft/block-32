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
    DROP TABLE IF EXISTS flavors;
    CREATE TABLE flavors(
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    INSERT INTO flavors(name, is_favorite) VALUES ('vanilla', false);
    INSERT INTO flavors(name, is_favorite) VALUES ('cookies n cream', true);
    INSERT INTO flavors(name, is_favorite) VALUES ('chocolate', false);
    INSERT INTO flavors(name, is_favorite) VALUES ('smores', true);
    INSERT INTO flavors(name, is_favorite) VALUES ('rocky road', false);
    `;

    await client.query(SQL);
    console.log("data seeded");

    const port = process.env.PORT || 3000;
    server.listen(port, () => console.log(`listening on port ${port}`));

    };

    server.get("/api/flavors", async (req, res, next) => {
        try {
            const SQL = `
            SELECT * FROM flavors;
            `;
    
            const response = await client.query(SQL);
    
            res.send(response.rows);
            } catch (error) {
                next(error);
            };
        });

    server.get("/api/flavors/:id", async (req, res, next) => {
        const {id} = req.params
        try {
            const SQL = `
            SELECT * FROM flavors
            WHERE id=$1`

            const response = await client.query(SQL, [id])

            res.send(response.rows)
            
        } catch (error) {
            console.log(error)
        }
    });

    server.post('/api/flavors', async (req, res, next ) => {
        const {name} = req.body
        try {
          const SQL = `
          INSERT INTO flavors (name)
          VALUES ($1)
          RETURNING *`  
          
          const response = await client.query(SQL, [name])
          res.json(response.rows)

        }   catch (error) {
            console.log (error)
        }
    });

    server.delete("/api/flavors/:id", async (req, res, next) => {
         const {id} = req.params
         try {
            const SQL = `
            DELETE FROM flavors
            WHERE id=$1`
            await client.query(SQL,[id])
            res.send("deleted")

         } catch (error) {
            console.log(error)
         }
    });

    server.put('/api/flavors/:id', async (req, res, next ) => {
        const {name} = req.body
        const {id}= req.params
        try {
          const SQL = `
          UPDATE flavors
          SET name=$1
          WHERE id=$2
          RETURNING *`
          const response = await client.query(SQL, [name, id])
          res.json(response.rows)

        }   catch (error) {
            console.log (error)
        }
    });

        

    
    // init function invocation
    init();
    
    // static routes here (you only need these for deployment)
    server.use(express.static(path.join(__dirname, "../client/dist")));
    
    // server routes here
    server.get("/", (req, res) =>
        res.sendFile(path.join(__dirname, "../client/dist/index.html"))
        );