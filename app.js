const express = require("express");
const app = express();
const path = require('path');
const port = 3000;
const uri = 'mongodb+srv://Admin:admin123@cluster0.vzs9g.mongodb.net/TODOS?retryWrites=true&w=majority';
const {MongoClient, ObjectId} = require("mongodb");
const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});

app.use(express.urlencoded());
app.set('view-engine', 'ejs')
app.use(express.static('./public'));

 // ============================================== opens main page (reads the todo list) ================================
app.get('/', (req, res) =>
{
    client.connect(async err =>
    {
        if (err) throw err;
        const todoCollection = client.db("TODOS").collection("todoCollection");
        await todoCollection.find({}).toArray( (err, todos) => 
        {
            if (err) throw err;
            res.render('./index.ejs', {todos});
        });
    });
});

 // ============================================== add todo ================================
app.post('/add', (req, res) =>
{
    console.log("inside add");
    req.body.isChecked = false;
    client.connect(async err =>
    {
        if (err) throw err;
        const todoCollection = client.db("TODOS").collection("todoCollection");
        await todoCollection.insertOne(req.body, (err, result) =>
        {
            if (err) throw err;
            if(result.acknowledged)
                console.log(result.insertedCount + " document inserted successfully!");
            else
                console.log("There was an error in inserting the document");
            res.redirect('/');
        });
    });
});

 // =============================================== delete todo =====================================
app.get('/delete/:id', (req,res) =>
{
    console.log("inside delete");
    client.connect(async err =>
    {
        const id = 'new ObjectId("' + req.params.id + '.toString()")';
        if (err) throw err;
        const todoCollection = client.db("TODOS").collection("todoCollection");
        todoCollection.deleteOne({"_id" : new ObjectId(req.params.id)}, (err, result) =>
        {
            if (err) throw err;
            if(result.acknowledged)
                console.log(result.deletedCount + " document deleted successfully!");
            else
                console.log("There was an error in deleting the document");
            res.redirect('/');
        });
    })
 });

  // ================================================= toggle todo checked request =================================================

app.get('/toggleTodoChecked/:_id/:isChecked', (req,res) =>
{

    console.log("inside toggle todo");
    const todoCollection = client.db("TODOS").collection("todoCollection");
    const isChecked = req.params.isChecked === 'true';
    todoCollection.updateOne({"_id" : new ObjectId(req.params._id)}, {$set : {"isChecked" : isChecked}} , (err, result) =>
    {
        if (err) throw err;
        if(result.acknowledged)
            console.log(result.updatedCount + " document updated successfully!");
        else
            console.log("There was an error in updating the document");
    });
    res.redirect('/');
});

 // ============================================== if no page found ======================================
app.use((req, res) =>   
    {
        res.sendFile(path.join(__dirname, '/public/404.html'));
    }
)
app.listen(port);

// {$cond: {if: {$eq: ["isChecked", "checked"]}, then: "", else: "checked"}}}}
    