'use strict'

const { response } = require('express');
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
    let queryObject = {
        q: `${req.body.searchby}: ${req.body.search}`,
    };

    if(req.body.search[1] === 'title'){ url += `intitle:${req.body.search[0]}`;}
    if(req.body.search[1] === 'author'){ url += `inauthor:${req.body.search[0]}`;}

    superagent.get(url)
    .query(queryObject)
    .then(data => {
        let books = data.body.items.map(book => new Book (book));
        response.status(200).render('pages/search-results', {books: books});
    });
};
 
function Book(data) {
    let url = 'https://i.imgur.com/J5LVHEL.jpg';
    this.title = data.volumeInfo.title || 'no title available';
    this.author = data.volumeInfo.authors;
    this.tempLink = data.volumeInfo.imageLinks ? data.volumeInfo.imageLinks.thumbnail : url; 
    this.description = data.volumeInfo.description;
    // this.amount = data.saleInfo.listPrice ? data.saleInfo.listPrice.amount: 'Unknown';

    if (tempLink.slice(5) === 'https') {
        console.log(secure);
    } else {
        tempLink = 'https' + tempLink.slice(4, tempLink.length)
    }
    this.image = tempLink;    
}





//Error Handler
app.use((err, request, response) => {
    console.error(err);
    response.status(500).send(err.message);
});







app.listen(PORT, () => {
    console.log(`listening on port: ${PORT}`);
});
