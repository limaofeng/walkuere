import { RouterState } from 'connected-react-router';

export interface ITodo {
  id: string;
  title: string;
  completed: boolean;
}

export interface State {
  todo: TodoState;
  router: RouterState;
}

export interface TodoState {
  todos: ITodo[];
}
