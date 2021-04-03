import React, { Component } from "react";
import PropTypes from 'prop-types';
import enroute from 'enroute';
import invariant from 'invariant';

export default class Router extends Component {
  static propTypes = {
    chlidren: PropTypes.array,
    location: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);

    // We'll store the routes on the Router component
    this.routes = {};

    this.addRoutes(props.children);

    // Set up the router for matching & routing
    this.router = enroute(this.routes);
  }

  addRoute (element, parent) {
    const { component, path, children } = element.props;

    invariant(component, `Route ${path} is missing the "path" property`);
    invariant(typeof path === 'string', `Route ${path} is not a string`);

    const render = (params, renderProps) => {
      const finalProps = Object.assign({ params }, this.props, renderProps);  // 将父组件的属性与子组件的属性合并在一起

      const children = React.createElement(component, finalProps);  // 使用合并后的属性创建新组件

      return parent ? parent.render(params, { children }) : children;
    };

    const route = this.normalizeRoute(path, parent);

    if (children) {
      this.addRoutes(children, { route, render });
    }

    this.routes[this.cleanPath(route)] = render;
  }

  addRoutes (routes, parent) {
    React.Children.forEach(routes, route => this.addRoute(route, parent));
  }

  cleanPath (path) {
    return path.replace(/\/\//g, '/');  // cleanPath使用String.replace从path属性(/)中移除所有双斜杠字符
  }

  normalizeRoute (path, parent) {  // 函数接收路径和父路由对象--路由属性是一个路径字符串
    // 如果路径只是一个'/'，可以直接返回它--不需要把它与父路由连接在一起
    if (path[0] === '/') {
      return path;
    }

    // 如果没有被提供父路由，可以直接返回路径
    if (parent == null) {
      return path;
    }

    return `${parent.route}/${path}`;  // 有父路由，通过连接将路径加入父路由的路径中
  }

  render () {
    const { location } = this.props;
    invariant(location, '<Router /> needs a location to work');
    return this.router(location);
  }
}

// enroute example
// function edit_user (params, props) {
//   return Object.assign({}, params, props);
// }

// const router = enroute({
//   '/users/new': create_user,
//   '/users/:slug': find_user,
//   '/users/:slug/edit': edit_user,
//   '*': not_found
// });

// enroute('/users/mark/edit', { additional: 'props' });