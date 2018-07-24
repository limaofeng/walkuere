import * as React from 'react';
import { Route } from 'react-router-dom';
import { Feature, InAction } from 'walkuere';
import TodoList from './containers/TodoList';
import { ITodo, TodoState } from './types';

import { Utils } from './utils';

export default new Feature({
  namespace: 'todo',
  state: {
    todos: []
  },
  reducers: {
    add({ todos }: TodoState, action: InAction<string>) {
      todos.push({
        id: Utils.uuid(),
        title: action.payload,
        completed: false
      });
      return { todos: [...todos] };
    },
    toggle({ todos }: TodoState, action: InAction<string>) {
      return {
        todos: todos.map(todo => {
          if (todo.id === action.payload) {
            todo.completed = !todo.completed;
            return { ...todo };
          }
          return todo;
        })
      };
    },
    destroy({ todos }: TodoState, action: InAction<string>) {
      return {
        todos: todos.filter(todo => todo.id !== action.payload)
      };
    },
    save({ todos }: TodoState, action: InAction<ITodo>) {
      return {
        todos: todos.map(todo => {
          if (todo.id === action.payload.id) {
            return { ...todo, title: action.payload.title };
          }
          return todo;
        })
      };
    },
    toggleAll({ todos }: TodoState, { payload: completed }: InAction<boolean>) {
      return { todos: todos.map(todo => ({ ...todo, completed })) };
    },
    clearCompleted({ todos }: TodoState) {
      return { todos: todos.filter(({ completed }) => !completed) };
    }
  },
  routes: <Route key="todo" path="/" component={TodoList} />
});
