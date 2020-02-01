//Install express server
const express = require('express');
const path = require('path');
let  PORT = process.env.PORT || 6666;
const app = express();

// Serve only the static files form the dist directory
app.use(express.static(__dirname + '/dist/TradingviewAPI'));

app.get('/*', function(req,res) {

  res.sendFile(path.join(__dirname+'/dist/TradingviewAPI/index.html'));
});

// Start the app by listening on the default Heroku port
app.listen(PORT, function (){
  console.log("listing on port : "+ PORT)
});
