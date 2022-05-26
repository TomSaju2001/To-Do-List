const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

var items = [];
var workItems = [];

app.get("/", function(request, response){
  var today = new Date();

  var options = {
    weeday: "long",
    day: "numeric",
    month: "long"
  };

  var day = today.toLocaleDateString("en-US", options);
  response.render("list", {listTitle: day, newListItems: items});
});

app.post("/", function(request, response){
  var item = request.body.newItem;

    if(request.body.list === "Work List"){
        workItems.push(item);
        response.redirect("/work");
    }else{
        items.push(item);
        response.redirect("/");
    }
});

app.get("/work", function(request, response){
  response.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.listen(3000, function(){
  console.log("Server is running on port 3000!");
});
