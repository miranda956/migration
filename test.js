'use strict';

const fs = require('fs');
const r =require("rethinkdb");
const info =require('./makiti/cities.json');

let cities =JSON.stringify(info)
    
    
console.log(cities)
let product =JSON.parse(cities)
r.connect( {host: 'localhost', port: 28015}, function(err, conn) {
    if (err) throw err;

    r.db('makiti').table('cities').
    insert(Object.values(product)).run(conn, function(err, result) {
        if (err) throw err;
        console.log(JSON.stringify(result, null, 2));
    });

});





