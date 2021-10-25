#! /usr/bin/env node


// @ts-nocheck

let   fs = require("fs"),
sharp =require("sharp"),

https = require('https'),

r = require("rethinkdb"),
rs = require("randomstring"),

// load data from json file 

 dbs ={...(
		JSON.parse(
			fs.readFileSync(__dirname + "/datadbs.json")
		)
	) },



    user, uget, uarr, newUser, newUsers = {},
    city, uget, uarr, newCity, newCities = {},
	pimg, pget, parr, newPimg, newPimgs = {}, 
	cimg, cget, carr, newCimg, newCimgs = {}, 
	uaudio, uaget, uaarr, newUaudio, newUaudios = {}, 
	newShop, sget, sarr, newShops ={},
	limg, lget, larr, newLimg, newLimgs = {}, 
	scimg, scget, scarr, newSCimg, newSCimgs = {}, 
	post, newPost, newPosts = {},
	audio, aget, aarr, newAudio, newAudios = {}, 

    country,uget,uarr,newCountry,newCountries={},
    language,newLanguage,newLanguages={},
    state,newState,newStaties={},
    products,newProducts,newProducts={},
	img, iget, iarr, newImg, newImgs = {},
	category,newCategory,newCategories={},
	subCategory,newsubCategory,newSubCategories={}
	


    ttest = /^6[1256]\d{7}$/,
	etest = /^[a-z0-9._-]+@[a-z0-9._-]{2,}\.[a-z]{2,4}$/
;

async function arrify(cursor) {
	return new Promise((resolve, reject) => {
		cursor.toArray((err, arr) => {
			if(err) reject(err);
			resolve(arr);
		});
	});
}


for(let mdb in dbs) {
	if(dbs[mdb].type == "table") {
		dbs[ dbs[mdb].name ] = dbs[mdb].data;
		
	}
	delete dbs[mdb];
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

	newUser = {
		status: "new",
		old: true,
		banned:false,
		slug:{},
		coords_lat:{},
		coords_lng:{},
		about_me: {},
		"notes-hist": [],
		"has-profile": (user.avatar && (/^https/.test(user.avatar))),
		"has-cover": false,
		"has-audio": false,
        facebook_url:{},
        twitter_url:{},
        instagram_url:{},
        pinterset_url:{},
		linkedin_url:{},
		youtube_url:{},
        country:[],
        state:[],
		google:[],
		facebook:[],
		twitter:[],
		"old-id": user.id
	};

	if(user.created_at)
		newUser.created = (new Date(user.created_at)).getTime();
	else newUser.created = (new Date).getTime();

	if(user.phone_number) {
		user.phone_number = user.phone_number
			.replace(/\D/g, "")
		;

		if(/^224/.test(user.phone_number))
			user.phone_number  = user.phone_number.slice(3);
	}

	if(
		!user.phone_number &&
		(/^6[1256]\d{7}@makitiplus\.com/.test(user.u_login))
	) {
		user.phone_number = user.u_login.replace("@makitiplus.com", "");
	}

	if(ttest.test(user.phone_number)) {
		newUser.tel = user.phone_number;
		newUser.ccode = "224";
	}
	else user.phone_number = undefined;

	if(user.email) {
		user.email = user.email.toLowerCase();
		if(
			etest.test(user.email) &&
			!(/@makitiplus\.com$/.test(user.email))
		)
			newUser.email = user.email;
		else user.email = undefined;
	}

	if(!newUser.tel && !newUser.email) continue;

	if(user.first_name) newUser.name = user.first_name;

	if(user.last_name) newUser.surname = user.last_name;

	if(user.address) newUser.address = user.address;

	newUsers[user.id] = newUser;

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
	},	newUaudios[user.id] = newUaudio;


	
	if(user.shop_name) {
		newShop = {
			name: user.shop_name,slug:{},
			description: user.shop_name,
			cat: 9,
			note: 0,
			category:{},
			coords_lat:{},
			coords_lng:{},
			notes: {},
			"notes-hist": [],
			"has-logo": (user.avatar && (/^https/.test(user.avatar))),
			"has-cover": false,
			"has-audio": false,
			"old-id": user.id
		};

		if(user.created_at)
			newShop.created = (new Date(user.created_at)).getTime();
		else newShop.created = (new Date()).getTime();

		if(user.phone_number)
			newShop.tel = "+224" + user.phone_number;

		if(user.email) newShop.email = user.email;

		if(user.address) newShop.address = user.address;

		newShops[user.id] = newShop;

		newLimg = {
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
			"old-shop": user.id,
			"old-img": ((user.avatar && (/^https/.test(user.avatar)))? user.avatar : 0)
		};
		newLimgs[user.id] = newLimg;

		newSCimg = {
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
			resolution: 512,
			"old-c-shop": user.id
		};
		newSCimgs[user.id] = newSCimg;

		newSaudio = {
			"is-img": false,
			key: rs.generate({length: 32, charset: "alphanumeric"}),
			status: "unsent",
			requirements: {
				"max-size": 15728640,
				"min-size": 0,
				types: ["aac","bin","mid","midi","mp3","oga","ogx","opus","wav","weba"]
			},
			"old-a-shop": user.id
		};
		newSaudios[user.id] = newSaudio;
	}

	user = {};
	newUser = {};
}
for(let pkey in mdbs.products) {
	post = mdbs.products[pkey];

	newPost = {
        negociable:true,
        Audio_description:[],
        sub_category:{},
        type_of_article:{},
        use_shop_voice_signature:{},
        coords_lat:{},
        coords_name:{},
        posted_on:{},
        countries:[],
        person_contacts:[],
        shops:[],
        states:[],
        users:[]

		
	};

	if(post.created_at) newPost.created = (new Date(post.created_at)).getTime();
	else newPost.created = (new Date()).getTime();

	if(post.title) newPost.name = post.title;

	if(post.description) newPost.description = post.description.slice(3, -4);

	if(post.category_id) newPost.cat = post.category_id;

	if(post.price) newPost.price = post.price;

	newPosts[post.id]= newPost;

	
	post = {};
	newPost = {};
}
for(let cokey in mdbs.countries) {
	country = mdbs.countries[cokey];

	newCountry= {
		country_name:user.country.name,
		
	};

	if(country.created_at) newCountry.created = (new Date(country.created_at)).getTime();
	else newCountry.created = (new Date()).getTime();

	if(country.name) newCountry.name = country.name;

	
	newCountries[country.id]= newCountry;

	
	country = {};
	newCountry = {};
}

for(let ckey in mdbs.categories) {
	category = mdbs.categories[ckey];

	newCategory= {
		image:[],
		keywords:{},
		category_order:{},
		image_for_mobile_app:[]

		
	};

	if(category.created_at) newCategory.created = (new Date(category.created_at)).getTime();
	else newCategory.created = (new Date()).getTime();

	if(category.title) newCategory.name = category.title;
	if(category.slug)  newCategory.slug =category.slug;
    if(category.description) newCategory.description=category.description;

	
	newCategories[category.id]= newCategory;

	
	category = {};
	newCategory = {};
}

for(let Skey in mdbs.staties) {
	state = mdbs.states[Skey];

	newState= {
		state:[],
        country:[]
		
	};

	if(state.created_at) newState.created = (new Date(state.created_at)).getTime();
	else newState.created = (new Date()).getTime();

	if(state.name) newState.name = state.name;

	
	newStaties[state.id]= newState;

	
	state = {};
	newStaties = {};
}

for(let lkey in mdbs.languages) {
	language= mdbs.languages[lkey];

	newLanguage= {
		language_french: false,
        language_english: false,
        language_kissi:false,
        language_konianke:false,
        language_Kpele:false,
        language_maninka:false,
        language_poular:false,
        language_sosso:false,
        language_toma:false,
        users:[]
		
	};

	if(language.created_at) newLanguage.created = (new Date(language.created_at)).getTime();
	else newLanguage.created = (new Date()).getTime();


	
	newLanguages[language.id]= newLanguage;

	
	language = {};
	newLanguage = {};
}


for(let ckey in mdbs.cities) {
	city = mdbs.cities[ckey];

	newCity= {
		city_name:user.cities.name,
        countries:[],
        states:[]
		
	};

	if(city.created_at) newcity.created = (new Date(city.created_at)).getTime();
	else newcity.created = (new Date()).getTime();

	if(city.name) newCity.name = city.name;

	
	newCities[city.id]= newCity;

	
	city = {};
	newCity = {};
}

for(let ckey in mdbs.cities) {
	categories= mdbs.cities[ckey];

	newCity= {
		city_name:user.cities.name,
        countries:[],
        states:[]
		
	};

	if(city.created_at) newcity.created = (new Date(city.created_at)).getTime();
	else newcity.created = (new Date()).getTime();

	if(city.name) newCity.name = city.name;

	
	newCities[city.id]= newCity;

	
	city = {};
	newCity = {};
}
for(let skey in mdbs.subcategories) {
	subCategory= mdbs.subCategories[skey];

	newsubCategory= {
        image:[],
		keywords:{},
		parent:[]
	};

	if(subCategory.created_at) newsubCategory.created = (new Date(subCategory.created_at)).getTime();
	else newsubCategory.created = (new Date()).getTime();

    if(subCategory.title) newsubCategory.title=subCategory.title;
	if(subCategory.description)newsubCategory.description=subCategory.description;
	if(subCategory.category_order)newsubCategory.category_order=subCategory.category_order;
	
	newSubCategories[city.id]= newCategories;

	subCategory= {};
	newsubCategory = {};
}
for(let ikey in mdbs.images) {
	img = mdbs.images[ikey];

	if(img.image_big) {
		newImg = {
			"is-img": true,
			key: rs.generate({length: 32, charset: "alphanumeric"}),
			is_main:true,
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
r.connect({
     	host: "194.62.96.24",
     	port: 1900
     }, async (err, conn) => {
     	if(err) console.error(err);
    	else {
    


            
            
            
    
     		await r.db("makiti-db").table("files")
    			.insert(Object.values(newPimgs)).run(conn);
     		pget = await r.db("makiti-db").table("files")
    			.hasFields("old-user").run(conn)
     		;
		parr = await arrify(pget);
    
     		for(let p in parr) {
 			pimg = parr[p];
     			newUsers[pimg["old-user"]]["profile"] = pimg.id;
     			newUsers[pimg["old-user"]]["profile-key"] = pimg.key;
     		}
    
     		// Users cover pics registration and linking
    	await r.db("makiti-db").table("files")
    		.insert(Object.values(newCimgs)).run(conn);
     		cget = await r.db("makiti-db").table("files")
    			.hasFields("old-c-user").run(conn)
    	;
    	carr = await arrify(cget);
            
    		for(let c in carr) {
    			cimg = carr[c];
    			newUsers[cimg["old-c-user"]]["cover"] = cimg.id;
    			newUsers[cimg["old-c-user"]]["cover-key"] = cimg.key;
    	}
    
    	// Users audios registration and linking
    	await r.db("makiti-db").table("files")
    		.insert(Object.values(newUaudios)).run(conn);
     		uaget = await r.db("makiti-db").table("files")
     			.hasFields("old-a-user").run(conn)
    		;
    	uaarr = await arrify(uaget);
            
    for(let a in uaarr) {
    		uaudio = uaarr[a];
    		newUsers[uaudio["old-a-user"]]["audio"] = uaudio.id;
    		newUsers[uaudio["old-a-user"]]["audio-key"] = uaudio.key;
    	}
    
    
    // 		// Users registration
    	await r.db("makiti-db").table("users")
    			.insert(Object.values(newUsers)).run(conn);
    
    		uget = await r.db("makiti-db").table("users").run(conn);
            	uarr = await arrify(uget);
    
    		for(let u in uarr) {
      		user = uarr[u];
      		newUsers[user["old-id"]].id = user.id;
    
    		if(newShops[user["old-id"]])
    			newShops[user["old-id"]].owner = user.id;
    	}
    
    
    // 		// Shop logos registration and linking
         	await r.db("makiti-db").table("files")
    		.insert(Object.values(newLimgs)).run(conn);
    	lget = await r.db("makiti-db").table("files")
    		.hasFields("old-shop").run(conn)
    		;
      	larr = await arrify(lget);
    
           for(let l in larr) {
   			limg = larr[l];
      	newShops[limg["old-shop"]]["logo"] = limg.id;
    // 			newShops[limg["old-shop"]]["logo-key"] = limg.key;
    // 		}
    
    // 		// Shop covers registration and linking
    	await r.db("makiti-db").table("files")
    			.insert(Object.values(newSCimgs)).run(conn);
    	scget = await r.db("makiti-db").table("files")
    		.hasFields("old-shop").run(conn)
    	;
    		scarr = await arrify(scget);
    
    	for(let sc in scarr) {
    			scimg = scarr[sc];
    			newShops[scimg["old-shop"]]["cover"] = scimg.id;
    		newShops[scimg["old-shop"]]["cover-key"] = scimg.key;
    		}
    
    	// Shop audios registration and linking
    		await r.db("makiti-db").table("files")
    			.insert(Object.values(newSaudios)).run(conn);
    		saget = await r.db("makiti-db").table("files")
    		.hasFields("old-a-shop").run(conn)
    	;
     		saarr = await arrify(saget);
    
    	for(let sa in saarr) {
    			saudio = saarr[sa];
			newShops[saudio["old-a-shop"]]["audio"] = saudio.id;
    			newShops[saudio["old-a-shop"]]["audio-key"] = saudio.key;
    		}
    
    		await r.db("makiti-db").table("shops")
    		.insert(Object.values(newShops)).run(conn)
    
    		sget = await r.db("makiti-db").table("shops").run(conn);
    		sarr = await arrify(sget);
     		for(let s in sarr) {
    			shop = sarr[s];
    		newShops[shop["old-id"]] = shop;
    		}
    
    		for(let i in newImgs) {
    			if(!newPosts[newImgs[i]["old-post"]])
    			delete newImgs[i]
    		}
    
     		await r.db("makiti-db").table("files")
    		.insert(Object.values(newImgs)).run(conn);
    		iget = await r.db("makiti-db").table("files")
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
    
    	// Post audios registration and linking
    		await r.db("makiti-db").table("files")
    		.insert(Object.values(newAudios)).run(conn);
    	aget = await r.db("makiti-db").table("files")
    			.hasFields("old-a-post").run(conn)
    		;
    		aarr = await arrify(aget);
    
    	for(let a in aarr) {
 			audio = aarr[a];
    		newPosts[audio["old-a-post"]]["audio"] = audio.id;
     			newPosts[audio["old-a-post"]]["audio-key"] = audio.key;
     		}
    
    		for(let p in newPosts) {
 			post = newPosts[p];
    
    		if(newUsers[post["old-owner"]]) {
    				post.owner = newUsers[post["old-owner"]].id;
    
    			if(newShops[post["old-owner"]])
     					post.shop = newShops[post["old-owner"]].id;
    }
    		else
    				post.owner = newUsers[84].id;
                
     			delete post["old-owner"];
    		}
    
     		await r.do(
    			r.db("makiti-db").table("users")
    			.replace(r.row.without("old-id"))
    		,
    			r.db("makiti-db").table("shops")
			.replace(r.row.without("old-id"))
    			,
    		r.db("makiti-db").table("files")
    			.replace(r.row.without(
					"old-user",
    			"old-shop",
    				"old-post"
    			))
    		,
    			r.db("makiti-db").table("posts")
     				.insert(Object.values(newPosts))
    	).run(conn)
    
		conn.close();
    }
    });
