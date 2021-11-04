#! /usr/bin/env node
// @ts-nocheck

// user account migration 

let fs = require("fs"),
https =require("https"),
r= require("rethinkdb"),
sh =require("sharp"),

mdbs=[
    {
        		type: "table",
        		name: "users",
        	   data: JSON.parse(
         			fs.readFileSync(__dirname + "/makiti/users.json")
        	).RECORDS
        	}

   
],

user, uget, uarr, newUser, newUsers = {},
cimg, cget, carr, newCimg, newCimgs = {},
pimg, pget, parr, newPimg, newPimgs = {},
ttest = /^6[1256]\d{7}$/,
	etest = /^[a-z0-9._-]+@[a-z0-9._-]{2,}\.[a-z]{2,4}$/
;

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
		"has-profile": (user.avatar && (/^https/.test(user.avatar))),
		"has-cover": false,
        country:[],
        state:[],
        city:[],
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

	

	

	user = {};
	newUser = {};
}

r.connect({
    host:"127.0.0.1",
    port:28015
}, async(err,conn)=>{
    if(err)console.error(err);
else{

	await r.db("makiti").table("users")
		.insert(Object.values(newUsers)).run(conn);

	uget = await r.db("makiti").table("users").run(conn);	uarr = await arrify(uget);

 		for(let u in uarr) {
		user = uarr[u];
		newUsers[user["old-id"]].id = user.id;

		if(newShops[user["old-id"]])
			newShops[user["old-id"]].owner = user.id;
	}
}
}
)
