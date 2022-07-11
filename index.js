const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const axios = require('axios');
const { json, urlencoded } = express;

const app = express();

const posts = {};

const handleEvent = ({ type, data }) => {
  if (type === 'PostCreated') {
    const { id, title } = data;

    posts[id] = { id, title, comments: [] };
  }

  if (type === 'CommentCreated') {
    const { id, content, postId, status } = data;
    const post = posts[postId];

    post.comments.push({ id, content, status });
  }

  if (type === 'CommentUpdated') {
    const { id, content, postId, status } = data;
    const post = posts[postId];

    const comment = post.comments.find((comment) => comment.id === id);

    comment.status = status;
    comment.content = content;
  }
};

app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(morgan('tiny'));

app.get('/posts', (req, res) => {
  res.status(200).json(posts);
});

app.post('/events', (req, res) => {
  const { type, data } = req.body;
  handleEvent({ type, data });
  res.status(201).json({});
});

app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });

  console.log(err.message);
});

app.listen(4002, async () => {
  console.log('Listening on 4002');
  try {
    const res = await axios.get('http://event-bus-srv:4005/events');
    if (res?.data?.event) {
      for (let event of res.data) {
        console.log('Processing event:', event.type);
  
        handleEvent(event.type, event.data);
      }
    }
  } catch (error) {
    console.log(error.message);
  }
});
