import React, { Component } from 'react';

export default function async_wrapper(importComponent, el_loading) {
  class AsyncWrapper extends Component {
    constructor(props) {
      super(props);

      this.state = {
        component: null
      };
    }

    async componentDidMount() {
      const { default: component } = await importComponent();

      this.setState({ component });
    }

    render() {
      const C = this.state.component;

      return C ? <C {...this.props} /> : el_loading ? el_loading : null;
    }
  }

  return AsyncWrapper;
}
