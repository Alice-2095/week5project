let mongodb=require('mongodb');

let express=require('express');
let app= express();
let bodyParser=require('body-parser');

let mongoDBClient = mongodb.MongoClient;

                    //server/port no
let  url = "mongodb://localhost:27017/";

let viewsPath=__dirname+"/views/"; //[path to the folder contains the html files]

app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static('views'));   //[set static assets]  

app.engine('html',require('ejs').renderFile); /*express should be 
                                able to render ejs templates, ejs: embed js into html*/ 
app.set('view engine','html');


let db=null; //global

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

app.post('/addnewtask', function (req, res) {
    
    let taskDetails = req.body;
        taskDetails.newId= Math.round(Math.random()*100);
    let obj={ taskID: taskDetails.newId, tname: taskDetails.taskname, assignto: taskDetails.assignto, duedate:taskDetails.duedate, 
        tstatus:taskDetails.taskstatus, tdescr:taskDetails.taskdescr};
    db.collection('w5table').insertOne(obj);
    res.redirect('/listAllTasks'); // redirect the client to list tasks page
});


app.get('/listAllTasks', function (req, res) {
     
    db.collection('w5table').find({}).toArray(function (err, data) {
        console.log(data);
        res.render(viewsPath +'getAllTasks.html', { taskDb: data });
    });
});


app.get('/deleteTask', function (req, res) {
    res.sendFile(viewsPath + 'deleteTask.html');
});

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

app.get('/updateTaskStatus', function (req, res) {
    res.sendFile(viewsPath + 'updateTask.html');
});

app.post('/udatetaskdata', function (req, res) {
    let taskDetails =  req.body;   
    let filter = { taskID: parseInt(taskDetails.taskid) }; 
    let theUpdate = { $set: { tstatus: taskDetails.taskstatus } };
    db.collection('w5table').updateOne(filter, theUpdate,
     { upsert: true }, function (err, result) {
    });    
    res.redirect('/listAllTasks');// redirect the client to get all tasks page    
});

app.listen(8080);  






