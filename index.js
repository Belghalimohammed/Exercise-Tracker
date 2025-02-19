const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const { ObjectId } = require('mongodb');

const cors = require('cors')
require('dotenv').config()

app.use(cors())

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


users = {}
exercices = {}

app.post('/api/users', (req, res) => {
  let { username } = req.body;
  let id;
  do {
     id = new ObjectId().toHexString();
  } while (id in users);
  users[id] = username;

  return res.json({
    username: username,
    _id: id
  });
});

app.get('/api/users', (req, res) => {
    let list = Object.keys(users).map((e) => ({
      _id: e,
      username: users[e]
      
    }))

    return res.json(list);
});

app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  let { description,duration,date } = req.body;

  date = date ? new Date(date) : new Date()

  n = {
    username: users[_id],
    description: description,
    duration: parseInt(duration),
    date: date.toDateString(),
    _id: _id
  }
  if (_id in exercices) {
    exercices[_id].push(n);
  } else {
    exercices[_id] = [];
    exercices[_id].push(n);
  }
  

  

  return res.json(n);

});



app.get('/api/users/:_id/logs', (req, res) => {
  let { _id } = req.params;
  let { from, to, limit } = req.query;
  let obj ;
 

  obj = {
    username: users[_id],
    from:from,
    to:to,
    count:exercices[_id].length,
    _id : _id,
    log : exercices[_id].map((e) => ({
      description: e.description,
      duration: parseInt(e.duration),
      date: e.date
      
    }))
   };


   if(from) {
    obj.log = obj.log.filter(e => new Date(e.date).getTime() >= new Date(from).getTime() );

   }
   if(to) {
    obj.log = obj.log.filter(e => new Date(e.date).getTime() <= new Date(to).getTime() );

   }
   if(limit) {
    obj.log = obj.log.slice(0,limit)
   }
   
 
  obj.count = obj.log.length;
  return res.json(obj);

});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
