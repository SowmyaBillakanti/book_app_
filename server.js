'use strict'

const express = require('express');
const superagent = require('superagent');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({extended:true}));
app.set('view engine', 'ejs');