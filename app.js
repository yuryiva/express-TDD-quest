// app.js
const express = require('express');
const bodyParser = require('body-parser');

require('dotenv').config();
const connection = require('./connection');
const { urlencoded } = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (request, response) => {
  response.status(200).json({ message: 'Hello World!' });
});

app.post('/bookmarks', (request, response) => {
  const { url, title } = request.body;
  if (!url || !title) {
    response.status(422).json({ error: 'required field(s) missing' });
  } else {
    connection.query(
      'INSERT INTO bookmark (url, title) VALUES (?, ?)',
      [url, title],
      (err, results) => {
        if (err) {
          console.log(err);
          response.status(500).json({ error: 'failed to save bookmark' });
        } else {
          connection.query(
            `SELECT * from bookmark WHERE id=${results.insertId}`,
            (err, results) => {
              if (err) {
                console.log(err);
                response.status(500).json({ error: 'failed to load bookmark' });
              } else {
                response.status(201).json(results[0]);
              }
            }
          );
        }
      }
    );
  }
});


app.get('/bookmarks/:id', (request, response) => {

  connection.query(
    'SELECT * FROM bookmark WHERE id=?', request.params.id,
    (err, results) => {
      if (err) {
        console.log(err);
        response.status(500).json({ error: 'failed to load bookmark' });
      } else {
        if (results.length > 0){
          response.status(200).json(results[0]);
        } else {
          response.status(404).json({ error: 'Bookmark not found'});
        }
      }
    }
  );
});



module.exports = app;