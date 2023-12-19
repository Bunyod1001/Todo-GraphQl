const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLList, GraphQLBoolean, GraphQLNonNull } = require('graphql');
const fs = require('fs/promises');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Ma'lumotlarni saqlash uchun JSON fayli
let todos = [];

const TodoType = new GraphQLObjectType({
  name: 'Todo',
  fields: () => ({
    id: { type: GraphQLString },
    text: { type: GraphQLString },
    completed: { type: GraphQLBoolean },
  }),
});

const RootQueryType = new GraphQLObjectType({
  name: 'RootQuery',
  fields: {
    todos: {
      type: GraphQLList(TodoType),
      resolve: () => todos,
    },
  },
});

const RootMutationType = new GraphQLObjectType({
  name: 'RootMutation',
  fields: {
    createTodo: {
      type: TodoType,
      args: {
        text: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: (parent, args) => {
        const newTodo = {
          id: String(todos.length + 1),
          text: args.text,
          completed: false,
        };
        todos.push(newTodo);
        return newTodo;
      },
    },
    updateTodo: {
      type: TodoType,
      args: {
        id: { type: GraphQLNonNull(GraphQLString) },
        text: { type: GraphQLString },
        completed: { type: GraphQLBoolean },
      },
      resolve: (parent, args) => {
        const todo = todos.find((todo) => todo.id === args.id);
        if (!todo) throw new Error('Todo not found');
        if (args.text !== undefined) todo.text = args.text;
        if (args.completed !== undefined) todo.completed = args.completed;
        return todo;
      },
    },
    deleteTodo: {
      type: TodoType,
      args: {
        id: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: (parent, args) => {
        const index = todos.findIndex((todo) => todo.id === args.id);
        if (index === -1) throw new Error('Todo not found');
        const deletedTodo = todos.splice(index, 1)[0];
        return deletedTodo;
      },
    },
  },
});

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
});

app.use('/graphql', graphqlHTTP({ schema, graphiql: true }));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
