import * as React from 'react';
import { connect } from 'react-redux';
import { ACTIVE_TODOS, ALL_TODOS, COMPLETED_TODOS, ENTER_KEY } from '../components/constants';
import { TodoFooter } from '../components/Footer';
import { TodoItem } from '../components/TodoItem';
import { State, ITodo } from '../types';

import 'todomvc-app-css/index.css';
import 'todomvc-common/base.css';

export interface IAppProps {
  model?: ITodoModel;
  todos: ITodo[];
  addTodo: (title: string) => void;
  toggle: (id: string) => void;
  destroy: (id: string) => void;
  save: (id: string, title: string) => void;
  toggleAll: (checked: boolean) => void;
  clearCompleted: () => void;
  nowShowing: string;
}

export interface IAppState {
  editing?: string;
  nowShowing?: string;
}

class TodoList extends React.Component<IAppProps, IAppState> {
  public state: IAppState;
  private newField: HTMLInputElement | null;

  constructor(props: IAppProps) {
    super(props);
    this.state = {
      nowShowing: ALL_TODOS,
      editing: undefined
    };
  }

  public handleNewTodoKeyDown = (event: React.KeyboardEvent) => {
    if (event.keyCode !== ENTER_KEY) {
      return;
    }

    event.preventDefault();

    const newField = this.newField as HTMLInputElement;

    const val = newField.value.trim();

    if (val) {
      this.props.addTodo(val);
      newField.value = '';
    }
  };

  public toggleAll = (event: React.FormEvent) => {
    const target: any = event.target;
    const checked = target.checked;
    this.props.toggleAll(checked);
  };

  public toggle(todoToToggle: ITodo) {
    this.props.toggle(todoToToggle.id);
  }

  public destroy(todo: ITodo) {
    this.props.destroy(todo.id);
  }

  public edit(todo: ITodo) {
    this.setState({ editing: todo.id });
  }

  public save(todoToSave: ITodo, text: string) {
    this.props.save(todoToSave.id, text);
    this.setState({ editing: undefined });
  }

  public cancel() {
    this.setState({ editing: undefined });
  }

  public render() {
    const { nowShowing, todos } = this.props;
    let footer;
    let main;

    const shownTodos: ITodo[] = todos.filter(todo => {
      switch (nowShowing) {
        case ACTIVE_TODOS:
          return !todo.completed;
        case COMPLETED_TODOS:
          return todo.completed;
        default:
          return true;
      }
    });

    const todoItems = shownTodos.map(todo => {
      return (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={this.props.toggle.bind(this, todo.id)}
          onDestroy={this.props.destroy.bind(this, todo.id)}
          onEdit={this.edit.bind(this, todo)}
          editing={this.state.editing === todo.id}
          onSave={this.save.bind(this, todo)}
          // tslint:disable-next-line:jsx-no-lambda
          onCancel={e => this.cancel()}
        />
      );
    });

    // Note: It's usually better to use immutable data structures since they're
    // easier to reason about and React works very well with them. That's why
    // we use map(), filter() and reduce() everywhere instead of mutating the
    // array or todo items themselves.
    // tslint:disable-next-line:only-arrow-functions
    const activeTodoCount = todos.reduce(function(accum, todo) {
      return todo.completed ? accum : accum + 1;
    }, 0);

    const completedCount = todos.length - activeTodoCount;

    if (activeTodoCount || completedCount) {
      footer = (
        <TodoFooter
          count={activeTodoCount}
          completedCount={completedCount}
          nowShowing={nowShowing || ''}
          onClearCompleted={this.props.clearCompleted}
        />
      );
    }

    if (todos.length) {
      main = (
        <section className="main">
          <input
            id="toggle-all"
            className="toggle-all"
            type="checkbox"
            onChange={this.toggleAll}
            checked={activeTodoCount === 0}
          />
          <label htmlFor="toggle-all">Mark all as complete</label>
          <ul className="todo-list">{todoItems}</ul>
        </section>
      );
    }

    return (
      <div>
        <header className="header">
          <h1>todos</h1>
          <input
            ref={ref => {
              this.newField = ref;
            }}
            className="new-todo"
            placeholder="What needs to be done?"
            onKeyDown={this.handleNewTodoKeyDown}
            autoFocus={true}
          />
        </header>
        {main}
        {footer}
      </div>
    );
  }
}

export default connect(
  ({
    todo: { todos },
    router: {
      location: { hash: nowShowing }
    }
  }: State) => ({ todos, nowShowing: nowShowing.replace('#/', '') || 'all' }),
  dispatch => ({
    addTodo(title: string) {
      dispatch({ type: 'todo/add', payload: title });
    },
    toggle(id: string) {
      dispatch({ type: 'todo/toggle', payload: id });
    },
    destroy(id: string) {
      dispatch({ type: 'todo/destroy', payload: id });
    },
    save(id: string, title: string) {
      dispatch({ type: 'todo/save', payload: { id, title } });
    },
    toggleAll(checked: string) {
      dispatch({ type: 'todo/toggleAll', payload: checked });
    },
    clearCompleted() {
      dispatch({ type: 'todo/clearCompleted'});
    },
  })
)(TodoList);
