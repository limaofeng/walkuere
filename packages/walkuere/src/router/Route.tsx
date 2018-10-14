/* eslint no-useless-escape: 0 */
import React from 'react';
import { Route as OriginalRoute, RouteComponentProps } from 'react-router-dom';

import Bundle, { LazyModule } from './Bundle';

function argumentNames(fn?: LazyModule) {
  if (fn === undefined) {
    return [];
  }
  const names = fn
    .toString()
    .match(/^[\s\(]*function[^(]*\(([^\)]*)\)/)[1]
    .replace(/\s+/g, '')
    .split(',');
  return names.length === 1 && !names[0] ? [] : names;
}

function isLazyLoadComponent(fn?: LazyModule) {
  const names = argumentNames(fn);
  return names.length === 1 && names[0] === 'cb';
}

const lazyLoadComponent = (lazyModule?: LazyModule): any =>
  lazyModule.lazyRouteComponent ||
  ((props: any) => <Bundle load={lazyModule}>{(Container: any) => <Container {...props} />}</Bundle>);

export default class Route extends OriginalRoute {
  public render() {
    const { component } = this.props;
    return (
      <OriginalRoute
        {...this.props}
        component={isLazyLoadComponent(component) ? lazyLoadComponent(component) : component}
      />
    );
  }
}
