'use strict';

const fs = require('fs');
const r =require("rethinkdb");
const city =require('./makiti/cities.json');
const countries =require("./makiti/countries.json");
const staties =require("./makiti/states.json");

 
const cities =JSON.parse(city);
console.log(city)

r.connect( {host: 'localhost', port: 28015}, function(err, conn) {
    if (err) throw err;

    r.db('makiti').table('cities').
    insert(Object.values(city)).run(conn, function(err, result) {
        if (err) throw err;
        console.log(JSON.stringify(result, null, 2));
    });

    r.db('makiti').table('countries').
    insert(Object.values(countries)).run(conn, function(err, result) {
        if (err) throw err;
        console.log(JSON.stringify(result, null, 2));
    });
    r.db('makiti').table('state').
    insert(Object.values(staties)).run(conn, function(err, result) {
        if (err) throw err;
        console.log(JSON.stringify(result, null, 2));
    });

});





