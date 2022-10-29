const express = require("express");
const ejs = require("ejs");
const bp = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const getDates = require(__dirname + "/date.js");
// or require("./date")


const app = express();

// setting the view engine
app.set("view engine", "ejs");

// setting up the body parser
app.use(bp.urlencoded({ extended: true }));

// middleware for static files
app.use(express.static("public"));


let items = ["Buy Food", "Cook Food", "Eat Food"];
let workItems = [];
let item = "";

// defining the port Number
const port = process.env.PORT || 3000;

// connecting to the mongoose and a new database
mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewurlParser: true })
    .then(() => {
        console.log("Connected successfully to the database");
    })
    .catch(() => {
        console.log(err);
    })

// defining the schema "itemSchema"
const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
})

// defining the mogoose model with a collection name as items and model name as Item
const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    name: "Be Effecient"
})
const item2 = new Item({
    name: "Be consistent"
})
const item3 = new Item({
    name: "Be Successful!"
})

let defaultItems = [item1, item2, item3];



app.get("/", (req, res) => {
    //    let day=getDates.getDate();
    Item.find({}, (err, foundItems) => {
        if (err) {
            console.log(err);
        }
        else {
            if (foundItems.length === 0) {
                //  adding these items into the collection with mongoose
                Item.insertMany(defaultItems, (err) => {
                    if (!err) {
                        console.log("Successfully Saved the default Items in the collection");
                    }
                    else if (err) {
                        console.log(err);
                    }
                })
                res.redirect("/")
            }
            else {
                res.render("list", { listTitle: "Today", newListItem: foundItems });
            }
        }
    })

})

// Defining a customlist schema for the customList route
let listSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
})


app.post("/", (req, res) => {
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
        name: itemName
    })

    if (listName === "Today") {
        item.save();
        res.redirect("/");
    }
    else
    {
        List.findOne({name:listName},(err,foundItem)=>
        {
            foundItem.items.push(item);
            foundItem.save();
            res.redirect("/"+listName);
        })
    }

})

app.post("/delete", (req, res) => {
    const checkItemId = req.body.checkbox;
    const listName=req.body.listName;
    if(listName==="Today")
    {
        Item.findByIdAndRemove({ _id: checkItemId }, (err) => {
            if (!err) {
                console.log("Successfully Deleted the Item");
                res.redirect("/");
            }
            else {
                console.log(err);
            }
        })
    }
    else
    {
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkItemId}}},(err,foundList)=>
        {
            if(!err)
            {
                res.redirect("/"+listName);
            }
        })
    }
    
})




// Defining the model
const List = mongoose.model("List", listSchema);



app.get("/:customListName", (req, res) => {
    const customListName = _.capitalize(req.params.customListName);
    console.log(customListName);
    List.findOne({ name: customListName }, (err, foundListItem) => {
        if (!err) {
            if (!foundListItem) {
                // create a new list
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save()
                res.redirect("/" + customListName);
            }
            else {
                // show an existing list
                res.render("list", { listTitle: foundListItem.name, newListItem: foundListItem.items });
            }
        }
        else if (err) {
            console.log(err);
        }
    })
})


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})


// app.get("/work", (req, res) => {
//     res.render("list", { listTitle: "Work", newListItem: workItems });
// });

 // if (req.body.list === "Work") {
    //     console.log(req.body.list);
    //     workItems.push(item);
    //     res.redirect("/work");
    // }
    // else {
    //     console.log(req.body.list)
    //     items.push(item);
    //     res.redirect("/");
    // }