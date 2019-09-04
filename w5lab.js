let mongodb=require('mongodb');

let express=require('express');
let app= express();
let bodyParser=require('body-parser');

let mongoDBClient = mongodb.MongoClient;

  //connection URL
//let  url = "mongodb://" + process.argv[2] +  ":27017/";

let  url = "mongodb://localhost:27017/";

let viewsPath=__dirname+"/views/"; //[path to the folder contains the html files]

app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static('views'));   //[set static assets]  

app.engine('html',require('ejs').renderFile); /*express should be 
                                able to render ejs templates, ejs: embed js into html*/ 
app.set('view engine','html');


let db=null; //global. reference to database

//connect to mongoDB server
mongoDBClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true},
    function (err, client) {
        if (err) {
            console.log("Err  ", err);
        } else {
            console.log("Connected successfully to server");
            db = client.db("FIT2095");
        }
    });


app.get('/',function(req,res){   
     res.sendFile(viewsPath + "index.html"); 
});

//[POST request: receive the details from the client and 
//insert new document (i.e. object) to the collection (i.e. table)]
app.post('/addnewtask', function (req, res) {
    
    let taskDetails = req.body;
        taskDetails.newId= Math.round(Math.random()*100);
    let obj={ taskID: taskDetails.newId, tname: taskDetails.taskname, assignto: taskDetails.assignto, duedate:new Date(taskDetails.ddate), 
        tstatus:taskDetails.taskstatus, tdescr:taskDetails.taskdescr};
    db.collection('w5table').insertOne(obj);
    res.redirect('/listAllTasks'); // redirect the client to list tasks page
});

//[Get the list of documents form the collections, 
//send it to the rendering engine to generate an HTML to be the response.
//The rendering engine receives an array of documents under name 'taskDB']
app.get('/listAllTasks', function (req, res) {
     
    db.collection('w5table').find({}).toArray(function (err, data) {
        console.log(data);
        res.render(viewsPath +'getAllTasks.html', { taskDb: data });
    });
});

//send page to client to enter delete details
app.get('/deleteTask', function (req, res) {
    res.sendFile(viewsPath + 'deleteTask.html');
});

//receive user input and do the delete
//[sends data to server under pathname '/deletetaskdata', server listens to 
//POST request under this pathname]
app.post('/deletetaskdata', function (req, res) {
    let taskDetails =  req.body;
    let query = { taskID: parseInt(taskDetails.taskid) };
    console.log(query);
    db.collection('w5table').deleteOne(query);
    res.redirect('/listAllTasks');// redirect the client to get all tasks page
});


app.post('/deletecompletedtasks', function (req, res) {
    let filter = {tstatus: "Complete" };
    db.collection('w5table').deleteMany(filter, function (err, obj) {
        console.log(obj.result);
        res.redirect('/listAllTasks');// redirect the client to get all tasks page
      });
});

//Extra task
app.post('/deletecompletedtask1', function (req, res) {
    let filter = {$and:[ {tstatus: "Complete"} , {$lt:{duedate:new Date()} } ] };
    db.collection('w5table').deleteMany(filter, function (err, obj) {
        console.log(obj.result);
        res.redirect('/listAllTasks');// redirect the client to get all tasks page
      });
});

//send page to client to enter update details
app.get('/updateTaskStatus', function (req, res) {
    res.sendFile(viewsPath + 'updateTask.html');
});

//receive user input and do the update
//The server listens to the POST request with pathname=’updatetaskdata’ 
//and updates the status of the document.
app.post('/updatetaskdata', function (req, res) {
    let taskDetails =  req.body;   
    let filter = { taskID: parseInt(taskDetails.taskid) }; 
    let theUpdate = { $set: { tstatus: taskDetails.taskstatus } };
    db.collection('w5table').updateOne(filter, theUpdate,
     { upsert: true }, function (err, result) {
    });    
    res.redirect('/listAllTasks');// redirect the client to get all tasks page    
});

app.listen(8080);  






