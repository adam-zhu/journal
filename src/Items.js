import React, { Component } from "react";
import Header from "./Header";
import Nav from "./Nav";
import NewItemForm from "./NewItemForm";
import ItemTable from "./ItemTable";
import { disable_form } from "./util.js";
import { Link } from "react-router-dom";
import {
  time_ago,
  format_date_full,
  by_name_asc,
  by_name_desc,
  by_value_asc,
  by_value_desc,
  by_created_date_desc,
  by_last_logged_date_asc,
  by_last_logged_date_desc,
  scroll_viewport_to_top
} from "./util";

class Items extends Component {
  constructor(props) {
    super(props);

    scroll_viewport_to_top();

    this.state = {
      nav: false,
      find_options_open: true,
      find_query: "",
      item_sort: null,
      filtered_sorted_items: null
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

  find_options_open_handler = e => {
    e.preventDefault();

    this.setState({
      ...this.state,
      find_options_open: true
    });
  };

  find_options_close_handler = e => {
    e.preventDefault();

    this.setState({
      ...this.state,
      find_options_open: false
    });
  };

  find_query_input_handler = e => {
    const find_query = e.target.value;
    const items = this.props.items;
    const trimmed_cased_query = find_query.trim().toLowerCase();
    const filtered =
      trimmed_cased_query !== "" ? items.filter(i => i.name.toLowerCase().indexOf(trimmed_cased_query) !== -1) : items;
    const filtered_sorted_items = sort_items(this.state.item_sort, filtered);

    e.preventDefault();

    this.setState({
      ...this.state,
      find_query,
      filtered_sorted_items
    });
  };

  sort_handler = item_sort => e => {
    const find_query = this.state.find_query;
    const items = this.props.items;
    const trimmed_cased_query = find_query.trim().toLowerCase();
    const filtered =
      trimmed_cased_query !== "" ? items.filter(i => i.name.toLowerCase().indexOf(trimmed_cased_query) !== -1) : items;
    const filtered_sorted_items = sort_items(item_sort, filtered);

    e.preventDefault();

    this.setState({
      ...this.state,
      item_sort,
      filtered_sorted_items
    });
  };

  render() {
    const { items, active_log, score, today_score } = this.props;
    const { nav, find_options_open, find_query, item_sort, filtered_sorted_items } = this.state;
    const {
      nav_open_handler,
      nav_close_handler,
      find_options_open_handler,
      find_options_close_handler,
      find_query_input_handler,
      sort_handler
    } = this;
    const stats = [
      {
        label: "total items",
        value: items ? items.length : <span className="loader stat" />,
        subtitle: null,
        css_class: "total_score"
      }
    ];
    const table_items = filtered_sorted_items || items;
    const trimmed_cased_query = find_query.trim().toLowerCase();

    return (
      <div id="container" className={`${nav ? "nav_open" : ""}`}>
        <Header
          title={"Items"}
          stats={stats}
          nav_open_handler={nav_open_handler}
          el_right_side_anchor={
            <Link to={"/journal/create_item"}>
              <i className="material-icons">playlist_add</i>
            </Link>
          }
        />
        <Nav open={nav} active={"items"} nav_close_handler={nav_close_handler} />
        <div id="overlay" className={nav ? "visible" : ""} onClick={nav_close_handler} />
        <div className="items">
          <div className={`find_options ${find_options_open ? "open" : ""}`}>
            <form
              className={find_options_open ? "find_options_toggle open" : "find_options_toggle"}
              onSubmit={find_options_open ? find_options_close_handler : find_options_open_handler}
            >
              <button className="btn-flat">
                Options <i className="material-icons">chevron_right</i>
              </button>
            </form>
            <div id="find_options" className={find_options_open ? "open" : ""}>
              <form className="find_query_wrapper">
                <div className="input-field row">
                  <input
                    id="find_query"
                    name="find_query"
                    type="text"
                    className="validate"
                    onInput={find_query_input_handler}
                  />
                  <label htmlFor="find_query">Find item</label>
                </div>
              </form>
              <div className="sort_options_wrapper">
                <span className="section_label">Sort</span>
                {generate_sort_options(item_sort, sort_handler)}
              </div>
            </div>
          </div>
          <div className="items_table">
            {table_items === null ? (
              <span className="loader" />
            ) : table_items.length === 0 ? (
              trimmed_cased_query ? (
                <p className="empty_state">{`no items matching "${trimmed_cased_query}"`}</p>
              ) : (
                <p className="empty_state">no items available</p>
              )
            ) : (
              <ItemTable items={table_items} />
            )}
          </div>
          <Link id="create_item_button" className="floating_action_button" to={"/journal/create_item"}>
            <button className="btn-floating btn-large waves-light">
              <i className="material-icons">playlist_add</i>
            </button>
          </Link>
        </div>
      </div>
    );
  }
}

export default Items;

// UTILS
const sort_items = (item_sort, items) => {
  switch (item_sort) {
    case "name asc":
      return items ? items.sort(by_name_asc) : items;
    case "name desc":
      return items ? items.sort(by_name_desc) : items;
    case "value asc":
      return items ? items.sort(by_value_asc) : items;
    case "value desc":
      return items ? items.sort(by_value_desc) : items;
    case "last_logged asc":
      return items ? items.sort(by_last_logged_date_asc) : items;
    case "last_logged desc":
      return items ? items.sort(by_last_logged_date_desc) : items;
    default:
      return items ? items.sort(by_created_date_desc) : items;
  }
};
const generate_sort_options = (item_sort, sort_handler) => {
  let name = {
    css_class: "chip name",
    on_submit: sort_handler("name asc"),
    text: "Name",
    icon: ""
  };
  let value = {
    css_class: "chip value",
    on_submit: sort_handler("value asc"),
    text: "Value",
    icon: ""
  };
  let last_logged = {
    css_class: "chip last_logged",
    on_submit: sort_handler("last_logged asc"),
    text: "Last Logged",
    icon: ""
  };
  const sort_options = [name, value, last_logged];

  switch (item_sort) {
    case "name asc":
      name.css_class = name.css_class + " blue white-text";
      name.on_submit = sort_handler("name desc");
      name.icon = <i className="material-icons">arrow_upward</i>;
      break;
    case "name desc":
      name.css_class = name.css_class + " blue white-text";
      name.on_submit = sort_handler(null);
      name.icon = <i className="material-icons">arrow_downward</i>;
      break;
    case "value asc":
      value.css_class = value.css_class + " blue white-text";
      value.on_submit = sort_handler("value desc");
      value.icon = <i className="material-icons">arrow_upward</i>;
      break;
    case "value desc":
      value.css_class = value.css_class + " blue white-text";
      value.on_submit = sort_handler(null);
      value.icon = <i className="material-icons">arrow_downward</i>;
      break;
    case "last_logged asc":
      last_logged.css_class = last_logged.css_class + " blue white-text";
      last_logged.on_submit = sort_handler("last_logged desc");
      last_logged.icon = <i className="material-icons">arrow_upward</i>;
      break;
    case "last_logged desc":
      last_logged.css_class = last_logged.css_class + " blue white-text";
      last_logged.on_submit = sort_handler(null);
      last_logged.icon = <i className="material-icons">arrow_downward</i>;
      break;
  }

  const generate_option_markup = sort_option => (
    <li className={sort_option.css_class} onClick={sort_option.on_submit}>
      {sort_option.text}
      {sort_option.icon}
    </li>
  );
  const wrap = options => <ul className={item_sort ? `sort_options ${item_sort}` : "sort_options"}>{options}</ul>;

  return wrap(sort_options.map(generate_option_markup));
};