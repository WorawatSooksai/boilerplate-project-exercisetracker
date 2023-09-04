const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config();
var bodyParser = require("body-parser");

const mongoose = require('mongoose');

app.use(cors({ optionsSuccessStatus: 200 }))
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/test', { useNewUrlParser: true, useUnifiedTopology: true });

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

const Schema = mongoose.Schema;
const userSchema = new Schema({
  username: { type: String, required: true }, // String is shorthand for {type: String}
});
const exeSchema = new Schema({
  username: String, // String is shorthand for {type: String}
  description: String,
  duration: Number,
  exedate: Date,
  userid: String

});

const User = mongoose.model('User', userSchema);
const Exe = mongoose.model('Exe', exeSchema);
app.use(bodyParser.urlencoded({ extended: false }));

app.post("/api/users", (req, res) => {
  if (req.body.username) {
    let newUser = User({ username: req.body.username });
    newUser.save().then(u => {
      const userId = u._id.toHexString();
      console.log(u);
      res.json({ username: u.username, _id: userId });

    });
  } else {
    res.json({ error: "error blank username" });
  }

});

app.post("/api/users/:_id/exercises", (req, res) => {

  if (req.params._id) {

    // let timestamp = Date.parse(req.params.date);
    //   if (isNaN(timestamp) == false) {
    //     return res.json({error: "Invalid Date"});
    //   } 
    let exeuser = User.findById(req.params._id).then((p => {
      let edate = new Date(req.body.date).toDateString();
      if (edate == "Invalid Date") {
        edate = new Date().toDateString();
      }

      let newExe = new Exe({
        userid: p._id.toHexString(),
        username: p.username
        , description: req.body.description
        , duration: parseInt(req.body.duration)
        , exedate: new Date(edate)

      });


      newExe.save().then((data => {
        res.json({
          _id: p._id.toHexString(),
          username: p.username
          , date: new Date(req.body.date).toDateString()
          , duration: parseInt(req.body.duration)
          , description: req.body.description



        });
      }))
    }));



  } else {
    res.json({ error: "error blank _id" });
  }


});

app.get('/api/users/:_id/logs', (req, res) => {



  if (req.params._id) {


    User.findById(req.params._id).then(p => {
      let jsr = {
        _id: p._id.toHexString(),
        username: p.username,
        count: 0,
        log: []

      };
      let objexe = {
        userid: p._id.toHexString()

      };
      if (req.query.from) {
        let from = new Date(req.query.from);
        objexe.exedate = { $gte: from };

      }
      if (req.query.to) {
        let to = new Date(req.query.to);
        objexe.exedate = { $lt: to };
      }



      if (req.query.limit) {
        let limit = parseInt(req.query.limit);
        console.log(limit);
        let arr = Exe.find(objexe).limit(limit).then(p => { return p; });
        arr.then(function (r) {
          jsr.count = r.length;
          for (let i = 0; i < r.length; i++) {

            jsr.log.push({
              description: r[i].description,
              duration: parseInt(r[i].duration),
              date: new Date(r[i].exedate).toDateString()
            });


          }


          res.json(jsr);
        });
      } else {
        let arr = Exe.find(objexe).then(p => { return p; });
        arr.then(function (r) {
          jsr.count = r.length;
          for (let i = 0; i < r.length; i++) {

            jsr.log.push({
              description: r[i].description,
              duration: parseInt(r[i].duration),
              date: new Date(r[i].exedate).toDateString()
            });


          }
          res.json(jsr);
        });
      }

    });

  } else {
    User.find().then(p => {
      p.forEach((i, r) => {
        console.log(r[i]);
      });
    });
  }

});

app.get('/api/users', (req, res) => {
  User.find().select({ _id: 1, username: 1 }).then(p => {
    res.json(p);
  });
});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
