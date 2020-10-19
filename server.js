'use strict'

const express = require('express');
const superagent = require('superagent');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({extended:true}));

app.set('view engine', 'ejs');

app.get('/', (req , res) => {
    res.render('pages/index');
});

app.post('/searches', createSearch);

function createSearch(req, res) {
    let url = 'https://www.googleapis.com/books/v1/volumes?q=';
    console.log('body:', req.body);
    console.log('data:', req.body.search);

    if(req.body.search[1] === 'title'){ url += `intitle:${req.body.search[0]}`;}
    if(req.body.search[1] === 'author'){ url += `inauthor:${req.body.search[0]}`;}

    superagent.get(url)
    .then(data => {
        console.log('google books data:', data);
        res.json(data.text);
    })
    .catch(err => console.error(err))
};
app.listen(PORT, () => {
    console.log(`listening on port: ${PORT}`);
});
