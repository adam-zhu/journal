import React, { Component } from "react";

class HandleExteriorClickWrapper extends Component {
  constructor(props) {
    super(props);

    this.set_ref = this.set_ref.bind(this);
    this.document_click_handler = this.document_click_handler.bind(this);
  }

  set_ref = el => {
    this.wrapper_ref = el;
  };

  document_click_handler = e => {
    if (this.wrapper_ref && !this.wrapper_ref.contains(e.target)) {
      const should_prevent_default = true;
      this.props.exterior_click_handler(should_prevent_default)(e);
    }
  };

  document_touch_handler = e => {
    if (this.wrapper_ref && !this.wrapper_ref.contains(e.target)) {
      const should_prevent_default = false;
      this.props.exterior_click_handler(should_prevent_default)(e);
    }
  };

  componentDidMount() {
    document.addEventListener("mousedown", this.document_click_handler);
    document.addEventListener("touchstart", this.document_touch_handler);
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.document_click_handler);
    document.removeEventListener("touchstart", this.document_touch_handler);
  }

  render() {
    const wrapped = this.props.css_class ? (
      <div className={this.props.css_class} ref={this.set_ref}>
        {this.props.children}
      </div>
    ) : (
      <div ref={this.set_ref}>{this.props.children}</div>
    );

    return wrapped;
  }
}

export default HandleExteriorClickWrapper;
