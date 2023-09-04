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
  exedate: { type: Date }

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
    let exeuser = User.findById(req.params._id).then((p => {
      let newExe = new Exe({
        username: p.username
        , description: req.body.description
        , duration: req.body.duration
        , exedate: new Date(req.body.date).toDateString()
        , _id: p._id.toHexString()
      });

      newExe.save().then((data => {
        res.json({
          username: p.username
          , description: req.body.description
          , duration: req.body.duration
          , exedate: new Date(req.body.date).toDateString()
          , _id: p._id.toHexString()
        });
      }))
    }));



  } else {
    res.json({ error: "error blank _id" });
  }


});

app.get('/api/users' ,(req,res)=>{
  User.find().select({_id:1,username:1}).then(p=>{
    res.json(p);
  });
});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
