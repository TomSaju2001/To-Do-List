const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

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
};

//Model Creation
const Item = mongoose.model("Item", itemsSchema);

//Data1
const item1 = new Item({
  name: "Sample Item!!"
});

// const item2 = new Item({
//   name: "Hit the + button to add new item."
// });
//
// const item3 = new Item({
//   name: "<-- Hit this to delete an item."
// });

//saving it in an array so as to use insertMany() method instead of insertOne()
// const defaultItems = [item1, item2, item3];
const defaultItems = [item1];

//New schema for list Schema
const listSchema = {
  name: {
    type: String
  },
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

//version 1 storage!
// var items = [];
// var workItems = [];

var today = new Date();

var options = {
  weeday: "long",
  day: "numeric",
  month: "long"
};
var day = today.toLocaleDateString("en-US", options);

app.get("/", function(request, response) {


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
        newListItems: foundItems,
        listName: day
      });
    }
  });
});

app.post("/", function(request, response) {
  const itemName = request.body.newItem;
  const listName = request.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === day) {
    //save to db and redirect to home page
    item.save();
    response.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function(error, foundList) {
      foundList.items.push(item);
      foundList.save();
      response.redirect("/" + listName);
    });
  }

  // if (request.body.list === "Work List") {
  //   workItems.push(item);
  //   response.redirect("/work");
  // } else {
  //   items.push(item);
  //   response.redirect("/");
  // }
});

app.post("/delete", function(request, response) {
  const checkedItemId = request.body.checkbox;
  const listName = request.body.listName;

  if (listName === day) {
    Item.findByIdAndRemove(checkedItemId, function(error) {
      if (error) {
        console.log(error);
      } else {
        console.log("Successfully deleted checked item!");
        response.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({
      name: listName
    },{
      $pull: {items: {_id: checkedItemId}}
    },
  function(error, foundList){
    if(!error){
      response.redirect("/"+listName)
    }else{
      console.log(error);
    }
  });
  }

});

// app.get("/work", function(request, response) {
//   response.render("list", {
//     listTitle: "Work List",
//     newListItems: workItems
//   });
// });

app.get("/:customListName", function(request, response) {
  const customListName = _.capitalize(request.params.customListName);

  List.findOne({
    name: customListName
  }, function(error, foundList) {
    if (!error) {
      if (!foundList) {
        //console.log("Db doesn't exists!");
        //Create new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        response.redirect("/" + customListName);
      } else {
        //console.log("Db exists!")
        //Show existing list
        response.render("list", {
          listTitle: "" + day + " | " + foundList.name,
          newListItems: foundList.items,
          listName: foundList.name
        })
      }

    }
  });

});

app.listen(3000, function() {
  console.log("Server is running on port 3000!");
});
