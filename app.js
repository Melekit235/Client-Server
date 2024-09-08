const express = require('express');
const path = require('path');
const multer = require('multer');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');


let tasks = [
  { id: 1, title: 'gg', status: 'pending', dueDate: '2024-09-30', file: null },
  { id: 2, title: 'wp', status: 'completed', dueDate: '2024-09-10', file: null }
];

app.get('/', (req, res) => {
  const filter = req.query.filter || 'all';
  let filteredTasks = tasks;

  if (filter !== 'all') {
    filteredTasks = tasks.filter(task => task.status === filter);
  }

  res.render('index', { tasks: filteredTasks, filter });
});

app.get('/new', (req, res) => {
  res.render('form', { task: {}, action: '/create', method: 'POST' });
});

app.post('/create', upload.single('file'), (req, res) => {
  const { title, status, dueDate } = req.body;
  const newTask = {
    id: tasks.length + 1,
    title,
    status,
    dueDate,
    file: req.file ? req.file.filename : null
  };
  tasks.push(newTask);
  res.redirect('/');
});


app.get('/edit/:id', (req, res) => {
  const task = tasks.find(t => t.id == req.params.id);
  if (task) {
    res.render('form', { task, action: `/update/${task.id}`, method: 'POST' });
  } else {
    res.redirect('/');
  }
});

app.post('/update/:id', upload.single('file'), (req, res) => {
  const { title, status, dueDate } = req.body;
  const task = tasks.find(t => t.id == req.params.id);

  if (task) {
    task.title = title;
    task.status = status;
    task.dueDate = dueDate;
    if (req.file) {
      task.file = req.file.filename;
    }
  }
  res.redirect('/');
});


app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});
