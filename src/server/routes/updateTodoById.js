const { set } = require('../utils/lenses');
const { pipe } = require('../utils/functions');
const { BadRequestError } = require('./utils/Errors');

const requestedIdIsValid = id => !!id;
const todoDataIsValid = title => !!title;

const getHandler = getStorage => async (req, res) => {
  const { updateTodoById, models: { Todo } } = getStorage(req.__user);

  // Get lenses from the Todo model
  const {
    title: titleLens,
    description: descriptionLens
  } = Todo.lenses;

  const { id } = req.params;

  // Assume Todo data to have the same shape over the network as it is in the data model
  const title = titleLens.get(req.body);
  const description = descriptionLens.get(req.body);

  if (!todoDataIsValid(title) || !requestedIdIsValid(id)){
    throw new BadRequestError('Invalid todo data!');
  }

  // Create a new Todo object
  const data = pipe(
    set(titleLens, title),
    set(descriptionLens, description)
  )({});

  const updatedTodo = await updateTodoById(id, data);

  res.send({ data: updatedTodo });
};

module.exports = {
  requestedIdIsValid,
  todoDataIsValid,
  getHandler,
};
