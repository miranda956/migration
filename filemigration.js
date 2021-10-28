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
        fs.readFileSync(__dirname + "makiti/images.json")

    ).RECORDS
},
{
    type:"table",
    name:"media",
    data:JSON.parse(
        fs.readFileSync(__dirname + "makiti/media.json")

    ).RECORDS
}

],
img, iget, iarr, newImg, newImgs = {},//images
audio, aget, aarr, newAudio, newAudios = {},// audio files
pimg, pget, parr, newPimg, newPimgs = {},// Profile images
cimg, cget, carr, newCimg, newCimgs = {},//cover images
uaudio, uaget, uaarr, newUaudio, newUaudios = {},// user audio files
;
async function arrify(cursor) {
	return new Promise((resolve, reject) => {
		cursor.toArray((err, arr) => {
			if(err) reject(err);
			resolve(arr);
		});
	});
}

async function get(url) {
	return new Promise((resolve, reject) => {
		https.get(url, res => {
			let data = Buffer.alloc(0);
			res.on("data", chunk => {
				data = Buffer.concat([data, chunk]);
			});
			res.on("end", () => resolve(data));
		});
	});
}

for(let mdb in mdbs) {
	if(mdbs[mdb].type == "table") {
		mdbs[ mdbs[mdb].name ] = mdbs[mdb].data;
		fs.writeFileSync(
			__dirname + "/../tables/" + mdbs[mdb].name + ".json",
	JSON.stringify(mdbs[mdb].data)
	 );
	}
	delete mdbs[mdb];
}


for(let ikey in mdbs.images) {
	img = mdbs.images[ikey];

	if(img.image_big) {
		newImg = {
			"is-img": true,
			key: rs.generate({length: 32, charset: "alphanumeric"}),
			status: "sent",
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
for(let akey in mdbs.media) {
	audio = mdbs.media[akey];

	if(newPosts[audio.product_id]) {
		newAudio = {
			"is-img": false,
			key: rs.generate({length: 32, charset: "alphanumeric"}),
			status: "sent",
			requirements: {
				"max-size": 15728640,
				"min-size": 0,
				types: ["aac","bin","mid","midi","mp3","oga","ogx","opus","wav","weba"]
			},
			"old-a-post": audio.product_id
		};
		newAudios[audio.id] = newAudio;
	}

}

for(let ukey in mdbs.users) {
	user = mdbs.users[ukey];

	if(
		user.u_login == "**********account_deleted**********"
		|| (
			!user.u_login &&
			!user.phone_number &&
			!user.email
		)
	)
		continue;

	newPimg = {
			"is-img": true,
			key: rs.generate({length: 32, charset: "alphanumeric"}),
			status: ((user.avatar && (/^https/.test(user.avatar)))? "sent" : "unsent"),
			requirements: {
				"max-size": 15728640,
				"min-size": 0,
				types: ["webp","jpeg","jpg","png","gif"],
				"max-height": 4320,
				"max-width": 7680,
				"min-height": 512,
				"min-width": 512
			},
			resolution: 512,
			"old-user": user.id,
			"old-img": ((user.avatar && (/^https/.test(user.avatar)))? user.avatar : 0)
		};

		newPimgs[user.id] = newPimg;

		newCimg = {
			"is-img": true,
			key: rs.generate({length: 32, charset: "alphanumeric"}),
			status: "unsent",
			requirements: {
				"max-size": 15728640,
				"min-size": 0,
				types: ["webp","jpeg","jpg","png","gif"],
				"max-height": 4320,
				"max-width": 7680,
				"min-height": 512,
				"min-width": 512
			},
			"old-c-user": user.id
		};
		newCimgs[user.id] = newCimg;

		newUaudio = {
			"is-img": false,
			key: rs.generate({length: 32, charset: "alphanumeric"}),
			status: "unsent",
			requirements: {
				"max-size": 15728640,
				"min-size": 0,
				types: ["aac","bin","mid","midi","mp3","oga","ogx","opus","wav","weba"]
			},
			"old-a-user": user.id
		};
		newUaudios[user.id] = newUaudio;
	

}

r.connect({
    host:"194.62.96.24",
    port:1900

},async(err,conn)=>{
    if(err)console.error(err);
else{
     // audios 
     await r.db("makiti-makiti").table("files")
        .insert(Object.values(newAudios)).run(conn);
        aget =await r.db("makiti-makiti").table("files")
        .hasFields("old-a-post").run(conn);
        aarr=await arrify(aget);
        for(let a in aarr) {
            		audio = aarr[a];
             			newPosts[audio["old-a-post"]]["audio"] = audio.id;
             			newPosts[audio["old-a-post"]]["audio-key"] = audio.key;
             		}

                     await r.db("makiti-market").table("files")
                     			.insert(Object.values(newImgs)).run(conn);
                     		iget = await r.db("makiti-market").table("files")
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
         		// profile pic 
			  await r.db("makiti-market").table("files")
		.insert(Object.values(newPimgs)).run(conn);
	pget = await r.db("makiti-market").table("files")
			.hasFields("old-user").run(conn)
	;
	parr = await arrify(pget);

		for(let p in parr) {
		pimg = parr[p];		newUsers[pimg["old-user"]]["profile"] = pimg.id;
			newUsers[pimg["old-user"]]["profile-key"] = pimg.key;
	}
        
	await r.db("makiti-market").table("files")
			.insert(Object.values(newCimgs)).run(conn);
		cget = await r.db("makiti-market").table("files")
				.hasFields("old-c-user").run(conn)
		;
		carr = await arrify(cget);
			
		for(let c in carr) {
			cimg = carr[c];
				newUsers[cimg["old-c-user"]]["cover"] = cimg.id;
				newUsers[cimg["old-c-user"]]["cover-key"] = cimg.key;
	 		}
			 	// Users audios
				await r.db("makiti-market").table("files")
			 			.insert(Object.values(newUaudios)).run(conn);
			 		uaget = await r.db("makiti-market").table("files")
			 			.hasFields("old-a-user").run(conn)
			 		;
			 		uaarr = await arrify(uaget);
					 
			 		for(let a in uaarr) {
			 			uaudio = uaarr[a];
			 			newUsers[uaudio["old-a-user"]]["audio"] = uaudio.id;
			 			newUsers[uaudio["old-a-user"]]["audio-key"] = uaudio.key;
			 		}

}
} 
)	