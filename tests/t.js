var casper = require('casper').create();

casper.start('http://localhost:3000/licenziebi/axali');
	//document.querySelector('input[name="kle"]').setAttribute('value', "KLE");
	//this.fillSelectors('input[name="licenzia.licenziantisMonacemebi.pid"]')
	//	this.fill('form#axaliLicenzia',{
	//		'input[name="kle"]':'0100523656'
	//	},false);

casper.then(function() {
	console.log('asd');
	document.querySelector('input[name="licenzia.licenziantisMonacemebi.pid"]')
			.setAttribute('value', '01005023656');
	//document.querySelector('button[name="submit"]')
	//		.click();
});


//casper.then(function() {
//	this.evaluateOrDie(function() {
//		return /message sent/.test(document.body.innerText);
//	}, 'sending message failed');
//});



casper.run();