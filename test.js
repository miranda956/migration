'use strict';

const fs = require('fs');
const r =require("rethinkdb");
const city =require('./makiti/cities.json');
const countries =require("./makiti/countries.json");
const staties =require("./makiti/states.json");
const categories =require("./makiti/categories.json");
const items =require("./makiti/itemtypes.json");
const lang = require("./makiti/languages.json");
 const admin =require("./makiti/admin_user.json");
 const sub =require("./makiti/subcategories.json");
const cities =JSON.stringify(city);
const adm =JSON.stringify(admin);
const subcat =JSON.stringify(sub);
let sucat =JSON.parse(subcat)
let ad=JSON.parse(adm);
let language= JSON.stringify(lang);
let userlang=JSON.parse(language)
const state=JSON.stringify(staties);
const country =JSON.stringify(countries);
let countr =JSON.parse(country)
let data =JSON.parse(cities)
let info =JSON.parse(state)
let cat= JSON.stringify(categories)
let category = JSON.parse(cat)
let item= JSON.stringify(items)
let type=JSON.parse(item)
console.log(city)

r.connect( {host: '194.62.96.24', port:  1514}, function(err, conn) {
    if (err) throw err;

   r.db('makiti').table('itemTypes').
    insert(Object.values(type)).run(conn, function(err, result) {
        if (err) throw err;
        console.log(JSON.stringify(result, null, 2));
    });
//194.62.96.24
    r.db('makiti').table('categories').
    insert(Object.values(category)).run(conn, function(err, result) {
        if (err) throw err;
        console.log(JSON.stringify(result, null, 2));
    }); 
    
    r.db('makiti').table('states').
    insert(Object.values(info)).run(conn, function(err, result) {
        if (err) throw err;
        console.log(JSON.stringify(result, null, 2));
    });
    
     r.db('makiti').table('cities').
    insert(Object.values(data)).run(conn, function(err, result) {
        if (err) throw err;
        console.log(JSON.stringify(result, null, 2));
    }); 
    r.db('makiti').table('languages').
    insert(Object.values(userlang)).run(conn, function(err, result) {
        if (err) throw err;
        console.log(JSON.stringify(result, null, 2));
    });
    r.db('makiti').table('subCategories').
    insert(Object.values(sucat)).run(conn, function(err, result) {
        if (err) throw err;
        console.log(JSON.stringify(result, null, 2));
    }); 
    r.db('makiti').table('admins').
    insert(Object.values(ad)).run(conn, function(err, result) {
        if (err) throw err;
        console.log(JSON.stringify(result, null, 2));
    }); 
    r.db('makiti').table('countries').
    insert(Object.values(countr)).run(conn, function(err, result) {
        if (err) throw err;
        console.log(JSON.stringify(result, null, 2));
    }); 
});






