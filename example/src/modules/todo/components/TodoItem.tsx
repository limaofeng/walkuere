import classNames from 'classnames';
import * as React from 'react';
import { ENTER_KEY, ESCAPE_KEY } from './constants';

class TodoItem extends React.Component<ITodoItemProps, ITodoItemState> {
  public state: ITodoItemState;
  private editField: HTMLInputElement | null;

  constructor(props: ITodoItemProps) {
    super(props);
    this.state = { editText: this.props.todo.title };
  }

  /**
   * This is a completely optional performance enhancement that you can
   * implement on any React component. If you were to delete this method
   * the app would still work correctly (and still be very performant!), we
   * just use it as an example of how little code it takes to get an order
   * of magnitude performance improvement.
   */
  public shouldComponentUpdate(nextProps: ITodoItemProps, nextState: ITodoItemState) {
    return (
      nextProps.todo !== this.props.todo ||
      nextProps.editing !== this.props.editing ||
      nextState.editText !== this.state.editText
    );
  }

  /**
   * Safely manipulate the DOM after updating the state when invoking
   * `this.props.onEdit()` in the `handleEdit` method above.
   * For more info refer to notes at https://facebook.github.io/react/docs/component-api.html#setstate
   * and https://facebook.github.io/react/docs/component-specs.html#updating-componentdidupdate
   */
  public componentDidUpdate(prevProps: ITodoItemProps) {
    if (!prevProps.editing && this.props.editing) {
      const node = this.editField as HTMLInputElement;
      node.focus();
      node.setSelectionRange(node.value.length, node.value.length);
    }
  }

  public handleSubmit(event: React.FormEvent) {
    const val = this.state.editText.trim();
    if (val) {
      this.props.onSave(val);
      this.setState({ editText: val });
    } else {
      this.props.onDestroy();
    }
  }

  public render() {
    return (
      <li
        className={classNames({
          completed: this.props.todo.completed,
          editing: this.props.editing
        })}
      >
        <div className="view">
          <input
            className="toggle"
            type="checkbox"
            checked={this.props.todo.completed}
            onChange={this.props.onToggle}
          />
          <label onDoubleClick={this.handleEdit}>{this.props.todo.title}</label>
          <button className="destroy" onClick={this.props.onDestroy} />
        </div>
        <input
          ref={ref => {
            this.editField = ref;
          }}
          className="edit"
          value={this.state.editText}
          onBlur={e => this.handleSubmit(e)}
          onChange={e => this.handleChange(e)}
          onKeyDown={e => this.handleKeyDown(e)}
        />
      </li>
    );
  }

  private handleEdit = () => {
    this.props.onEdit();
    this.setState({ editText: this.props.todo.title });
  };

  private handleKeyDown(event: React.KeyboardEvent) {
    if (event.keyCode === ESCAPE_KEY) {
      this.setState({ editText: this.props.todo.title });
      this.props.onCancel(event);
    } else if (event.keyCode === ENTER_KEY) {
      this.handleSubmit(event);
    }
  }

  private handleChange(event: React.FormEvent) {
    const input: any = event.target;
    this.setState({ editText: input.value });
  }
}

export { TodoItem };
