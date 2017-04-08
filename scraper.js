"use strict";
let request = require('request'); //Load Request Module
let cheerio = require('cheerio'); //Load CheerIO Module
let json2csv = require('json2csv'); //Load JSON2CSV Module
let moment = require('moment'); //Load Moment Module
let file = require('fs'); //Load File System Module
const folder = './data';// Save Folder name Defa
const url = "http://shirts4mike.com"; //Website URL To Scrape
let totalshirt = []; //Create array of total shirt
let scrapeshirt = []; //Create Array that store shirt to scrape
let linkseen = []; //Create Array To Store Shirt That Already Seen
let csv = ["Title", "Price", "ImageURL", "URL", "Time", ]; //CSV Header
function errorshow(error){ //Error Showing Function
	console.error(error.message);
	file.appendFile('scraper-error.log', ` [${new Date()}] ${error.message}` ,  function(err){
		if(err) throw err;
		console.error('Error has been log in Error Log');
	});
}
function notokaystatus(){ //When it doesn't reply with 200 Status Code
let error = {};
error.message = "Server doesn't reply with 200 Okay Status , Please Check Your Internet Connection";
errorshow(error);
}

request(url,function(error,response,html){ //Send Request To Shirt4Mike
	if(error){
		errorshow(error); //If error show error and it would stop by rhrow
	}
	if(response&&response.statusCode == 200){  //If it reply with 200
		let $ = cheerio.load(html); //CheerIO errorLoad HTML
		$("a[href*='shirt']").each(function(){ //For Each Link Contain Shirt
			let href = $(this).attr('href');
			if(linkseen.indexOf(url+'/'+href) == -1) { //It never seen before
				linkseen.push(url+'/'+href); //Push it to link seen
			}
		});

		linkseen.forEach(function(eachlinkseen){ //Get Each Link Seen
			if(eachlinkseen.indexOf("?id=") > 0){
				scrapeshirt.push(eachlinkseen); //Push and Ready For Scraping
			}else{ //If it never seen
				request(eachlinkseen,function(error,response,html){
					
					//Send Request
					if(error){
						errorshow(error);
					}
					if(response&&response.statusCode == 200){
						let $ = cheerio.load(html);
						$("a[href*='shirt.php?id=']").each(function(){ //If it it is a shirt
							let href = $(this).attr('href');
							if(scrapeshirt.indexOf(url+'/' + href) == -1){ //It isn't in scrape shirt. Making sure of
								scrapeshirt.push(url+'/' + href); //Add To Scrape Shirt
						}
					});
						
		scrapeshirt.forEach(function(shirturl){ //Scrape Shirt

			request(shirturl,function(error,response,html){	 //Send Request to Each ScrapeShirt
				if(error){
					errorshow(error); //If error tell , log and throw
				}
				if(response&&response.statusCode ==200){ //Run only when it 200
					let $ = cheerio.load(html); //Load URL with CheerIO
					totalshirt.push({"Title":$("title").text(),"Price":$(".price").text(),"ImageURL":url+'/'+$(".shirt-picture img").attr("src"),"URL":response.request.uri.href,"Time":moment().format("MMMM Do YYYY, h:mm:ss a")});
					//Create Object and Push in to Total Shirt Array
					if(!file.existsSync(folder)){ //If defa folder doesn't exist
						file.mkdirSync(folder); // Create defa Folder
				}
				json2csv({data:totalshirt,fields:csv},function(err,csv){
						//Convert Object To CSV with json2csv module
						let filename = folder+'/'+ moment().format("YYYY[-]MM[-]DD") +'.csv'; //Set File Name
						file.writeFile(filename,csv,function(err){
							// Write File
							if(err){
								errorshow(err); //If Error Just tell error and log
							}
							console.log('File ' + filename +' Have Been Write and Update');	//File has been save

						});
					});              

				

			}else{
						notokaystatus(); //When it doesn't return 200 . Just say and throw
					}
				});
			

		});
	}else{
					notokaystatus(); //If not return 200 just tell, throw and log
				}

			});
			}
		});

	}else{
							notokaystatus(); //When it doesn't return 200 . Just say and throw

						}
					});
