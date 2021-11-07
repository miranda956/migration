#! /usr/bin/env node

// @ts-nocheck
let fs = require("fs"),
     r= require("rethinkdb"),
     rs=require("random-string-generator"),
     sh =require("sharp"),
// load data  from json file


mdbs =[ 
{ 
    type:"table",
    name:"images",
    data:JSON.parse(
        fs.readFileSync(__dirname + "/makiti/images.json")

    ).RECORDS
},


],
img, iget, iarr, newImg, newImgs = {}//images
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


for(let ikey in mdbs.images) {
	img = mdbs.images[ikey];

	if(img.image_big) {
		newImg = {
			key: rs.generate({length: 32, charset: "alphanumeric"}),
			ismain: "false",
			requirements: {
				"max-size": 15728640,
				"min-size": 0,
				types: ["webp","jpeg","jpg","png","gif"],
				"max-height": 4320,
				"max-width": 7680,
				"min-height": 512,
				"min-width": 512
			}, 
			resolution: 1080,
			"old-post": img.product_id,
			"old-img": "https://mk-v2-files.s3.eu-west-3.amazonaws.com/uploads/images/" + img.image_big
		};
		newImgs[img.id] = newImg;
	}

	img = {};
	newImg = {};
}



r.connect({
    host:"localhost",
    port:28015

},async(err,conn)=>{
    if(err)console.error(err);
else{
     

                  await r.db("makiti").table("files")
                     			.insert(Object.values(newImgs)).run(conn);
                     		iget = await r.db("makiti").table("files")
                     			.hasFields("old-post").run(conn)
                     		;
                     		iarr = await arrify(iget);
                     
                      		for(let i in iarr) {
                      			img = iarr[i];
                      			newPosts[img["old-post"]].imgs.push({
                      				fid: img.id,
                      				fkey: img.key
              
								});
                      		}
         	 
			 	
				

}
} 
)	

