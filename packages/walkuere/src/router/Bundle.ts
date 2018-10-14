import React from 'react';
import { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';

export type LazyModule = React.ComponentType<RouteComponentProps<any>> | React.ComponentType<any> | any;

interface Props {
  load: LazyModule;
  children: any;
}
interface State {
  mod?: any;
}

class Bundle extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      mod: undefined
    };
  }
  // 加载初始状态
  public componentWillMount() {
    this.load(this.props);
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (nextProps.load !== this.props.load) {
      this.load(nextProps);
    }
  }

  public load({ load }: Props) {
    // 重置状态
    this.setState({
      mod: undefined
    });
    // 传入组件的组件
    load((mod: any) => {
      load.lazyRouteComponent = mod.default ? mod.default : mod;
      this.setState({
        // handle both es imports and cjs
        mod: load.lazyRouteComponent
      });
    });
  }

  public render() {
    // if state mode not undefined,The container will render children
    return this.state.mod ? this.props.children(this.state.mod) : undefined;
  }
}

export default Bundle;
