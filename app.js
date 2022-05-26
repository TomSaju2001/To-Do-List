const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

//mongoose connection
mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true
});

//Schema creation
const itemsSchema = {
  name: {
    type: String
  }
}

//Model Creation
const Item = mongoose.model("Item", itemsSchema);

//Data1
const item1 = new Item({
  name: "Welcome to your todolist!!"
});

const item2 = new Item({
  name: "Hit the + button to add new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

//saving it in an array so as to use insertMany() method instead of insertOne()
const defaultItems = [item1, item2, item3];

//version 1 storage!
// var items = [];
// var workItems = [];

app.get("/", function(request, response) {
  var today = new Date();

  var options = {
    weeday: "long",
    day: "numeric",
    month: "long"
  };
  var day = today.toLocaleDateString("en-US", options);

  //Find items from // DEBUG:
  Item.find({}, function(error, foundItems) {

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(error) {
        if (error) {
          console.log(error);
        } else {
          console.log("Successfully saved the default items!!");
        }
      });
      response.redirect("/");
    } else {
      response.render("list", {
        listTitle: day,
        newListItems: foundItems
      });
    }
  });
});

app.post("/", function(request, response) {
  var item = request.body.newItem;

  if (request.body.list === "Work List") {
    workItems.push(item);
    response.redirect("/work");
  } else {
    items.push(item);
    response.redirect("/");
  }
});

app.get("/work", function(request, response) {
  response.render("list", {
    listTitle: "Work List",
    newListItems: workItems
  });
});

app.listen(3000, function() {
  console.log("Server is running on port 3000!");
});
