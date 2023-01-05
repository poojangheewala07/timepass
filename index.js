const express = require("express");
const { json } = require("express/lib/response");
const mysql = require("mysql");
const app = express();
let request = require('request').defaults({ rejectUnauthorized: false });


const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var fs = require('fs'); //require file system object

app.listen(3000, () => console.log('listening on port 3000...'));

app.use(express.json());

const courses = [
    { id: 1, name: 'course1' },
    { id: 2, name: 'course2' },
    { id: 3, name: 'course3' },
    { id: 4, name: 'course5' }
]

app.get('/', (req, res) => {
    res.send('Hello World hi');
});

app.get('/api/course', (req, res) => {
    res.send(courses);
})

app.get('/api/course/:id', (req, res) => {
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if (!course) return res.status(404).send('Data not found with given id');

    res.send(course);
});

app.post('/api/course', (req, res) => {
    const course = {
        id: courses.length + 1,
        name: req.body.name
    };
    courses.push(course);
    res.send(course);
});

app.put('/api/course/:id', (req, res) => {
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if (!course) return res.status(404).send('Data not found with given id');

    course.name = req.body.name;
    res.send(course);
});

app.delete('/api/course/:id', (req, res) => {
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if (!course) return res.status(404).send('Data not found with given id');

    const index = courses.indexOf(course);
    courses.splice(index, 1);

    res.send(course);
});

// Till here is for normal data CRUD using local object

// Display Data from a json file

app.get('/filedata', (req, res) => {
    fs.readFile("data.json", 'utf8', function (err, data) {
        data = JSON.parse(data);
        if (!data) return res.status(404).send('Data not found with given id');
        res.send(data);
    });
});

app.get('/filedata/:id', (req, res) => {
    fs.readFile("data.json", 'utf8', function (err, data) {
        data = JSON.parse(data);
        pdata = data["user" + req.params.id];
        if (!pdata) return res.status(404).send('Data not found with given id');
        res.send(pdata);
    });
});

// Display Data from a Database [phpmyadmin]

const conn = mysql.createConnection({
    host: 'http://sql107.epizy.com',
    user: 'epiz_33324458',
    pwd: 'ptNrYIOsQ5n0f',
    database: 'epiz_33324458_sample'
})

// 3 different API for different table
app.get('/database/student', (req, res) => {
    conn.query("select * from student", function (err, result, field) {
        if (err) return res.send("Query Faild to load data.")
        res.send(result);
    });
});

app.get('/database/employee', (req, res) => {
    conn.query("select * from employees", function (err, result, field) {
        if (err) return res.send("Query Faild to load data.")
        res.send(result);
    });
});

// crud on test1 table
app.get('/database/test1', (req, res) => {
    conn.query("select * from test1", function (err, result, field) {
        if (err) return res.send("Query Faild to load data.")
        var i = 0;
        var data = `<table border="1">
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                        </tr>`;
        while (i < result.length) {
            data += `<tr>
                        <td>`+ result[i].id + `</td>
                        <td>`+ result[i].name + `</td>
                     </tr>`;
            i++;
        }
        data += "</table>"
        res.send(data);
    });
});

app.get('/database/test1/:id', (req, res) => {
    const id = req.params.id;

    conn.query("select * from test1 where id = " + id + "", function (err, result, field) {
        if (err) return res.send("Query Faild to load data.")

        res.send(result);

    });
});

app.post('/database/test1', (req, res) => {
    const id = req.body.id;
    const name = req.body.name;

    conn.query("insert into test1 values(" + id + ",'" + name + "')", function (err, result, field) {
        if (err) return res.send("Query Faild to load data.")
        res.send("Data inserted successfully");
    });
});

app.delete('/database/test1/:id', (req, res) => {
    const id = req.params.id;

    conn.query("delete from test1 where id = " + id + "", function (err, result, field) {
        if (err) return res.send(" Query Faild to load data.")
        res.send("Data Deleted successfully");
        // res.send("/database/test1");
    });

})

// Crud on particular table
app.get('/database/athlete', (req, res) => {
    conn.query("select * from athlete", function (err, result, field) {
        if (err) return res.send("Query Faild to load data.")
        res.send(result);
    });
});

app.post('/database/athlete', (req, res) => {
    const name = req.body.name;
    const sport = req.body.sport;
    const nationality = req.body.nationality;
    const age = req.body.age;
    const weight = req.body.weight;
    const height = req.body.height;

    conn.query("insert into athlete values('" + name + "','" + sport + "','" + nationality + "'," + age + "," + weight + "," + height + ")", function (err, result, field) {
        if (err) return res.send("Query Faild to load data.")
        res.send("Data inserted successfully");
    });

});

// API to open form 
app.get('/login', (req, res) => {
    res.sendFile(__dirname + "/login.html");
});



app.post('/apicall', (req, res) => {
    const email = req.body.email;
    const pwd = req.body.pwd;
    // res.send(email + " : " + pwd);
    // res.redirect('https://192.168.1.101:50000/b1s/v1/Login');
    request.post(
        'https://192.168.1.101:50000/b1s/v1/Login',
        {
            json: {
                "CompanyDB": "TCPL_Live",
                "Password": pwd,
                "UserName": email
            }
        },
        function (error, response, body) {
            if (error) return res.send("Faild to Login." + error);
            // console.log('success');
            const sessionID = body.SessionId;
            res.send();
            // res.redirect("/fetchdata");
            // request.get(
            //     'https://192.168.1.101:50000/b1s/v1/ProductionOrders',
            //     function (error, response, body) {
            //         if (error) return res.send("Faild to Load Data." + error);
            //         res.send(body);
            //     }
            // );
        }
    );
});
