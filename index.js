const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { json, urlencoded } = express;

const app = express();

const posts = {};

app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(morgan('tiny'));

app.get('/posts', (req, res) => {
  res.status(200).json(posts);
});

app.post('/events', (req, res) => {
  const { type, data } = req.body;

  if (type === 'PostCreated') {
    const { id, title } = data;

    posts[id] = { id, title, comments: [] };
  }

  if (type === 'CommentCreated') {
    const { id, content, postId } = data;
    const post = posts[postId];

    post.comments.push({ id, content });
  }

  res.status(201).json({});
});

app.listen(4002, () => {
  console.log('Listening on port 4002');
});
