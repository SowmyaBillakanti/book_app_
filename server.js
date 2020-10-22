'use strict'
require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const app = express();
const PORT = process.env.PORT || 3000;
const pg = require('pg');
const methodOverride = require('method-override');

const client = new pg.Client(process.env.DATABASE_URL);

app.use(methodOverride('_method'));
app.use(express.urlencoded({extended:true}));
app.use(express.static('./public'));
app.set('view engine', 'ejs');
app.get('/', getBooks);
app.get('/books/:id', getOneBook);
app.post('/books', add);
app.post('/searches', createSearch);
app.put('/books/:id', updateBook);

function updateBook(request, response){
  let SQL = `UPDATE books SET author=$1, title=$2, isbn=$3, image_url=$4, description=$5, bookshelf=$6 WHERE id=$7;`;

  let values = [
    request.body.author,
    request.body.title,
    request.body.isbn,
    request.body.image_url,
    request.body.description,
    request.body.bookshelf,
    request.params.id
  ];
  console.log(values);
  client.query(SQL, values)
    .then(response => console.log(response))
    .then(response.redirect(`/books/${request.params.id}`))
    
    .catch(err => console.error(err));
}


// app.get('/', (req , res) => {
//     res.render('pages/index');
// });

function createSearch(req, res) {
    let url = 'https://www.googleapis.com/books/v1/volumes?';
    // console.log('body:', req.body);
    // console.log('data:', req.body.search);

    if(req.body.search[1] === 'title'){ url += `intitle:${req.body.search[0]}`;}
    if(req.body.search[1] === 'author'){ url += `inauthor:${req.body.search[0]}`;}
    let queryObject = {
        q:`${req.body.searchby}: ${req.body.search}`,
    };
    // console.log(queryObject)
    superagent.get(url)
    .query(queryObject)
    .then(data => {
        let books = data.body.items.map(book => new Book(book));
        // console.log(books);
        res.status(200).render('pages/search-results', {books: books});
        // console.log('google books data:', data);
        // res.json(data.text);
    }).catch(error => {console.log( 'error occured during new search',error)});    
};

function Book(data){
    let url = 'https://i.imgur.com/J5LVHEL.jpg';
    this.title = data.volumeInfo.title || 'no title available'; 
    this.author = data.volumeInfo.authors;
    let tempLink = data.volumeInfo.imageLinks ? data.volumeInfo.imageLinks.thumbnail : url;
    this.description = data.volumeInfo.description;
    this.amount = data.saleInfo.listPrice ? data.saleInfo.listPrice.amount : ' Unknown.';

    if (tempLink.slice(5) === 'https') {
        // console.log(secure);
    } else{
         tempLink ='https'+tempLink.slice(4, tempLink.length) 
    }
    this.image = tempLink;
  };

  function getBooks(req, res) {
    let SQL = 'SELECT * FROM books;';
    console.log("attempting to pull books");

    client.query(SQL)
    .then(result => {
        console.log('got db info');
        res.render('pages/index', { books: result.rows});
    })
    .catch(err => console.error(err));
  }

function getOneBook(req, res){
    let SQL = 'SELECT * FROM books WHERE id=$1';
    let values = [req.params.id];
    // console.log(req.params.id);
  
    return client.query(SQL, values)
      .then(result => {
        //   console.log(result.rows[0]);
        res.render('pages/books/show', { book: result.rows[0] })
      })
      .catch(err => console.error(err));
};
  
function add(request, response)  {
    // console.log(request.body);
    let SQL = `
      INSERT INTO books (author, title, isbn, image_url, description, bookshelf)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`;
  
    let VALUES = [
      request.body.author,
      request.body.title,
      request.body.isbn,
      request.body.image_url,
      request.body.description,
      request.body.bookshelf,
    ];

    client.query(SQL, VALUES)
      .then(results => {
          console.log('printing results')
          console.log(results.rows)
          let id = results.rows[0].id;

        response.status(200).redirect(`/books/${id}`);
      })
      .catch( error => {
        console.error(error.message);
      });
};
  
  // const show = function() {
  //   $( "#showform" ).load( "/form" );
  // }


// function showForm(event,response){
//  document.getElementById('.changeDetail').show();
    
//   };



  
 
   // Error Handler
   app.use( (err,request,response,next) => {
    console.error(err);
    response.status(500).send(err.message);
  });
    // 404 Handler
    app.use('*', (request, response) => {
        // console.log(request);
        response.status(404).send(`Can't Find ${request.pathname}`);
      });

client.connect()
.then(()=> {
app.listen(PORT, () => {
    console.log(`listening on port: ${PORT}`);
});
});
  

