import React, { Component } from "react";
import Header from "./Header";
import Nav from "./Nav";
import NewItemForm from "./NewItemForm";
import materialize from "materialize-css";
import { Link } from "react-router-dom";
import { time_ago, disable_form, scroll_viewport_to_top } from "./util";

class CreateItem extends Component {
  constructor(props) {
    super(props);

    scroll_viewport_to_top();

    this.state = {
      nav: false
    };
  }

  nav_open_handler = e => {
    e.preventDefault();

    this.setState({
      ...this.state,
      nav: true
    });
  };

  nav_close_handler = e => {
    e.preventDefault();

    this.setState({
      ...this.state,
      nav: false
    });
  };

  add_new_submit_handler = e => {
    const create_new = model => () => this.props.db.ref("items").push(model);
    const redirect_to_items = () => this.props.history.push("/journal/items");
    const el_form = e.target;
    const name = el_form.name.value.trim();
    const value = Number(el_form.value.value);
    const active = true;
    const created_date = Date.now();
    const model = {
      name,
      value,
      active,
      created_date
    };

    e.preventDefault();

    if (!name) {
      return alert("Item cannot be blank");
    }

    if (isNaN(value) || value === 0) {
      return alert("Value must be a nonzero number");
    }

    disable_form(el_form)
      .then(create_new(model))
      .then(redirect_to_items)
      .catch(alert);
  };

  render() {
    const { items, active_log, score, today_score } = this.props;
    const { nav } = this.state;
    const { nav_open_handler, nav_close_handler, add_new_submit_handler } = this;
    const last_created = items ? items[0] : null;
    const last_created_name_stat =
      items === null
        ? {
            label: "last created",
            value: <span className="loader stat" />,
            subtitle: null,
            css_class: "last_created"
          }
        : last_created
          ? {
              label: "last created",
              value: last_created.name,
              subtitle: [time_ago(last_created.created_date)],
              css_class: "text_value timestamp"
            }
          : {
              label: "last created",
              value: "none",
              subtitle: null,
              css_class: "text_value"
            };
    const last_created_value_stat =
      items === null
        ? {
            label: "value",
            value: <span className="loader stat" />,
            subtitle: null,
            css_class: "last_created"
          }
        : last_created
          ? {
              label: "value",
              value: last_created.value,
              subtitle: null,
              css_class: ""
            }
          : {
              label: "value",
              value: "none",
              subtitle: null,
              css_class: ""
            };

    return (
      <div id="container" className={`${nav ? "nav_open" : ""}`}>
        <Header
          title={"Create Item"}
          stats={[last_created_name_stat, last_created_value_stat]}
          nav_open_handler={nav_open_handler}
          el_right_side_anchor={
            <Link to={"/journal/items"}>
              <i className="material-icons">list</i>
            </Link>
          }
        />
        <Nav open={nav} active={"create_item"} nav_close_handler={nav_close_handler} />
        <div id="overlay" className={nav ? "visible" : ""} onClick={nav_close_handler} />
        <div className="row create_item">
          <NewItemForm submit_handler={add_new_submit_handler} button_text={"Create"} />
        </div>
      </div>
    );
  }
}

export default CreateItem;
