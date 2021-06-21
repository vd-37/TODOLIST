//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash")
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Admin-123:Vinayaka2001@cluster0.jkz0m.mongodb.net/todoListDB",{ useNewUrlParser : true, useUnifiedTopology: true, useFindAndModify: false});
const itemsSchema = { 
  item : {
    type : String,
    required : true
  }
}

const listSchema = {
  name : String ,
  items : [itemsSchema]
}

const Item = mongoose.model("Item" , itemsSchema)
const List = mongoose.model("List" , listSchema)
const item1 = new Item ({
  item : "Bake"
})
const item2 = new Item ({
  item : "Pack"
})
const item3 = new Item ({
  item : "Water the plants"
})

const defaultItems = [item1,item2,item3];
app.get("/", function(req, res) {
  Item.find({}, (err,result) => {
    if (result.length == 0) {
      Item.insertMany(defaultItems , (err) => {
        if (err) {
          console.log(err);
        }
        else{
          console.log("Items updated to DB");
        }
      })
      res.redirect("/")
    }
    else
    res.render("list", {listTitle: "Today", newListItems: result});
  });

});

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;   
  const newItem = new Item ({
    item : itemName
  })
  if(listName === "Today"){
    newItem.save()
    res.redirect("/")
  }
  else {
    List.findOne({name : listName} , (err , result) => {
      result.items.push(newItem) ;
      result.save()
      res.redirect("/" + listName)
    })
  }
 
});

app.post("/delete" , (req,res) =>{
  const itemId = req.body.deletedItem;
  const listName = req.body.listName;
  if(listName === "Today") {
    Item.findByIdAndRemove(itemId , (err) =>{
      if (!err) {
        console.log("Deleted");
        res.redirect("/")
      }
    }) 
  }
  else{
    List.findOneAndUpdate({name : listName} , {$pull : {items : {_id : itemId}}} , (err , result) => {
      if(!err)
        res.redirect("/"+ listName)
    })
  }
  
}); 

app.get("/:name", function(req,res){
  customeListName = _.capitalize(req.params.name);
  
  List.findOne({name : customeListName} , (err,result) => {
    if(!err){
      if(!result){
        const list = new List ({
          name : customeListName,
          items : defaultItems
        })
        list.save()
        res.redirect("/" + customeListName)
      }
      else{
        res.render("list" , {listTitle: result.name, newListItems: result.items })
      }
    }
  })
  
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT ||  3000, function() {
  console.log("Server started on port 3000");
});