const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();

router.get('/',function(req,res){
	// res.sendFile(path.join(__dirname+'/Udemy/3.13.0/index.html'));
	// res.sendFile(path.join(__dirname+'/Udemy/5.10.0/index.html'));
	// res.sendFile(path.join(__dirname+'/Udemy/2.08.0/index.html'));
	// res.sendFile(path.join(__dirname+'/Guide/bar-chart/index.html'));
	// res.sendFile(path.join(__dirname+'/Guide/flowers/index.html'));
	res.sendFile(path.join(__dirname+'/Udemy/index.html'));	
	// res.sendFile(path.join(__dirname + '/ELGrapho/index.html'))
});

//add the router
app.use(express.static(__dirname + '/Heirarchy/'), router);
// app.use(express.static(__dirname + '/Udemy/3.13.0/'), router);
// app.use(express.static(__dirname + '/Udemy/2.08.0/'), router);
// app.use(express.static(__dirname + '/ELGrapho/'))

app.listen(8000);
