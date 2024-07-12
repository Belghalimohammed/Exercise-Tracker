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
function getExercisesForUser(userId, from, to, limit) {
  let userExercises = exercises[userId] || [];
  
  // Filter exercises based on date range and limit
  let filteredExercises = userExercises.filter(exercise => {
    const exerciseDate = new Date(exercise.date);
    return exerciseDate >= new Date(from) && exerciseDate <= new Date(to);
  }).slice(0, limit);

  return filteredExercises.map(exercise => ({
    description: exercise.description,
    duration: exercise.duration,
    date: new Date(exercise.date).toDateString()
  }));
}
app.get('/api/users/:_id/logs', (req, res) => {
  const userId = req.params._id;
  const from = req.query.from || new Date(0).toISOString().substring(0, 10);
  const to = req.query.to || new Date(Date.now()).toISOString().substring(0, 10);
  const limit = Number(req.query.limit) || 0;

  let user = {
    _id: userId,
    username: users[userId]
  };

  let log = getExercisesForUser(userId, from, to, limit);

  res.json({
    ...user,
    count: log.length,
    log: log
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
