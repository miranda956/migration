#! /usr/bin/env node

// @ts-nocheck
let fs =require("fs"),
 r= require("rethinkdb"),
 sh=require("sharp"),

 mdbs=[
    {
        		type: "table",
        		name: "products",
        	   data: JSON.parse(
         			fs.readFileSync(__dirname + "/makiti/product.json")
        	).RECORDS
        	},

   
],

product, newProduct, newProducts = {}

;
async function arrify(cursor) {
	return new Promise((resolve, reject) => {
		cursor.toArray((err, arr) => {
			if(err) reject(err);
			resolve(arr);
		});
	});
}

for(let mdb in mdbs) {
	if(mdbs[mdb].type == "table") {
		mdbs[ mdbs[mdb].name ] = mdbs[mdb].data;
		fs.writeFileSync(
			__dirname + "/tables/" + mdbs[mdb].name + ".json",
	JSON.stringify(mdbs[mdb].data)
	 );
	}
	delete mdbs[mdb];
}

for(let pkey in mdbs.products){
    product=mdbs.products[pkey];

    newProduct={
        negociable:true,
        coords_lat:{},
		coords_lng:{},
		coords_name:{},
		product_status:"new",
		cities:[],
		country:[],
		shop:[],
		state:[],
		"old-owner": product.user_id

		
    };

	if(product.created_at) newProduct.created = (new Date(product.created_at)).getTime();
	else newProduct.created = (new Date()).getTime();

	if(product.title) newProduct.name = product.title;
	if(product.description) newProduct.description = product.description.slice(3, -4);
    if(product.audio_description) newProduct=product.audio_description;
	if(product.category_id) newProduct.cat = product.category_id;
	if(product.sub_Category_id) newProduct.sub_Category=product.sub_Category_id;
    if(product.slug) newProduct.slug=product.slug;

	if(product.price) newProduct.price = product.price;

	newProducts[product.id]= newProduct;
}

r.connect({
    host:"127.0.0.1",
    port:28015
}, async(err,conn)=>{
    if(err)console.error(err);
else{

	await r.db("makiti").table("products")
		.insert(Object.values(newProduct)).run(conn);


 		
}
}
)