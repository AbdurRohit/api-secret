const express = require('express')
const { Pool } = require('pg');
const app = express()
const port = 8080

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'postgres',
    port: 5432,
  });
  
  app.use(express.json());

  async function createAlbumsTable() {
    try {
      const query = `
        CREATE TABLE IF NOT EXISTS albums (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          artist VARCHAR(255) NOT NULL,
          price NUMERIC(10, 2)
        );
      `;
  
      await pool.query(query);
      console.log('Albums table created');
    } catch (err) {
      console.error(err);
      console.error('Albums table creation failed');
    }
  }
  
  createAlbumsTable();
  
  app.post('/albums', async (req, res) => {
    const { title, artist, price } = req.body;
    console.log(req.body);
    if (!title || !artist || !price) {
      return res.status(400).send('One of the title, or artist, or price is missing in the data');
    }
  
    try {
      
      const query = `
        INSERT INTO albums (title, artist, price)
        VALUES ($1, $2, $3)
        RETURNING id;
      `;
      const values = [title, artist, price];
  
      const result = await pool.query(query, values);
      res.status(201).send({ message: 'New Album created', albumId: result.rows[0].id });
    } catch (err) {
      console.error(err);
      res.status(500).send('some error has occured');
    }

  });
  app.get('/albums', async (req, res) => {
    try {
      const query = 'SELECT * FROM albums;';
      const { rows } = await pool.query(query);
      res.status(200).json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).send('failed');
    }
  }); 
  app.listen(port);