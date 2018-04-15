import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { create_item, add_entry_for_item } from '../Helpers/db_actions';
import {
  disable_form,
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
} from '../Helpers/util';
import async_wrapper from '../Helpers/AsyncWrapper';
const el_loading = <span className="loader" />;
const Header = async_wrapper(() => import('../Components/Header'), el_loading);
const Nav = async_wrapper(() => import('../Components/Nav'), el_loading);
const ActivityLogTable = async_wrapper(() => import('../Components/ActivityLogTable'), el_loading);
const NewItemForm = async_wrapper(() => import('../Components/NewItemForm'), el_loading);
const ItemTable = async_wrapper(() => import('../Components/ItemTable'), el_loading);

class Items extends Component {
  constructor(props) {
    super(props);

    scroll_viewport_to_top();

    this.state = {
      nav: false,
      find_options_open: true,
      find_query: '',
      item_sort: null,
      filtered_sorted_items: null,
      modal: false
    };
  }

  $MODAL_ID = 'modal';

  reset_modal_form_inputs_DOM = () => {
    const { $MODAL_ID } = this;
    document
      .getElementById($MODAL_ID)
      .querySelectorAll('.input-field')
      .forEach(el => {
        const el_input = el.querySelector('input');
        const el_label = el.querySelector('label');

        el_input.value = '';
        el_label.classList.remove('active');
      });
  };

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

  modal_open_handler = e => {
    e.preventDefault();

    // hack
    this.reset_modal_form_inputs_DOM();

    this.setState({
      ...this.state,
      modal: true
    });
  };

  modal_close_handler = e => {
    e.preventDefault();

    this.setState({
      ...this.state,
      modal: false
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
      trimmed_cased_query !== ''
        ? items.filter(i => i.name.toLowerCase().indexOf(trimmed_cased_query) !== -1)
        : items;
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
      trimmed_cased_query !== ''
        ? items.filter(i => i.name.toLowerCase().indexOf(trimmed_cased_query) !== -1)
        : items;
    const filtered_sorted_items = sort_items(item_sort, filtered);

    e.preventDefault();

    this.setState({
      ...this.state,
      item_sort,
      filtered_sorted_items
    });
  };

  log_handler = item => e => {
    const el_form = e.target;

    e.preventDefault();

    if (window.confirm(`Log ${item.name} for ${item.value}?`)) {
      const { db, user } = this.props;
      const log_the_item = add_entry_for_item({ db, uid: user.uid });
      const redirect_to_home = () => this.props.history.push('/journal');

      disable_form(el_form)
        .then(log_the_item(item))
        .then(redirect_to_home)
        .catch(alert);
    }
  };

  add_new_submit_handler = e => {
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
      return alert('Item cannot be blank');
    }

    if (isNaN(value) || value === 0) {
      return alert('Value must be a nonzero number');
    }

    const { db, user } = this.props;
    const create_the_item = create_item({ db, uid: user.uid });

    disable_form(el_form)
      .then(create_the_item(model))
      .then(() => {
        this.setState({
          modal: false
        });
      })
      .catch(alert);
  };

  render() {
    const { user, log_out_handler, items, active_log, score, today_score } = this.props;
    const {
      nav,
      find_options_open,
      find_query,
      item_sort,
      filtered_sorted_items,
      modal
    } = this.state;
    const {
      $MODAL_ID,
      nav_open_handler,
      nav_close_handler,
      modal_open_handler,
      modal_close_handler,
      find_options_open_handler,
      find_options_close_handler,
      find_query_input_handler,
      sort_handler,
      log_handler,
      add_new_submit_handler
    } = this;
    const total_items_stat = {
      label: 'total items',
      value: items ? items.length : <span className="loader stat" />,
      css_class: 'total_score'
    };
    const table_items = filtered_sorted_items || items;
    const trimmed_cased_query = find_query.trim().toLowerCase();

    return (
      <div id="container" className={`${nav ? 'nav_open' : ''} ${modal ? 'modal_open' : ''}`}>
        <Header
          title={'Items'}
          stats={[total_items_stat]}
          nav_open_handler={nav_open_handler}
          el_right_side_anchor={
            <Link to={'/journal/overview'}>
              <i className="material-icons">dashboard</i>
            </Link>
          }
        />
        <Nav
          user={user}
          log_out_handler={log_out_handler}
          open={nav}
          active={'items'}
          nav_close_handler={nav_close_handler}
        />
        <div id="overlay" className={nav ? 'visible' : ''} onClick={nav_close_handler} />
        <div className="items">
          <div className={`find_options ${find_options_open ? 'open' : ''}`}>
            <form
              className={find_options_open ? 'find_options_toggle open' : 'find_options_toggle'}
              onSubmit={find_options_open ? find_options_close_handler : find_options_open_handler}
            >
              <button className="btn-flat">
                Options <i className="material-icons">chevron_right</i>
              </button>
            </form>
            <div id="find_options" className={find_options_open ? 'open' : ''}>
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
              <ItemTable items={table_items} log_handler={log_handler} />
            )}
          </div>
          <form className="floating_action_button" onSubmit={modal_open_handler}>
            <button className="btn-floating btn-large waves-light">
              <i className="material-icons">playlist_add</i>
            </button>
          </form>
        </div>

        <div id={$MODAL_ID} className={modal ? 'open' : 'closed'}>
          <div id="modal_top">
            <form id="modal_control" onSubmit={modal_close_handler}>
              <button>
                <i className="material-icons">close</i>
              </button>
            </form>
            <h2 id="modal_title">
              Items<i className="material-icons">chevron_right</i>New Item
            </h2>
          </div>
          <div className="row new_item">
            <span className="section_label">Create New Item</span>
            <NewItemForm submit_handler={add_new_submit_handler} button_text={'Create'} />
          </div>
        </div>
      </div>
    );
  }
}

export default Items;

// UTILS
const sort_items = (item_sort, items) => {
  switch (item_sort) {
    case 'name asc':
      return items ? items.sort(by_name_asc) : items;
    case 'name desc':
      return items ? items.sort(by_name_desc) : items;
    case 'value asc':
      return items ? items.sort(by_value_asc) : items;
    case 'value desc':
      return items ? items.sort(by_value_desc) : items;
    case 'last_logged asc':
      return items ? items.sort(by_last_logged_date_asc) : items;
    case 'last_logged desc':
      return items ? items.sort(by_last_logged_date_desc) : items;
    default:
      return items ? items.sort(by_created_date_desc) : items;
  }
};
const generate_sort_options = (item_sort, sort_handler) => {
  let name = {
    css_class: 'chip name',
    on_submit: sort_handler('name asc'),
    text: 'Name'
  };
  let value = {
    css_class: 'chip value',
    on_submit: sort_handler('value asc'),
    text: 'Value'
  };
  let last_logged = {
    css_class: 'chip last_logged',
    on_submit: sort_handler('last_logged asc'),
    text: 'Last Logged'
  };
  const sort_options = [name, value, last_logged];

  switch (item_sort) {
    case 'name asc':
      name.css_class = name.css_class + ' blue white-text';
      name.on_submit = sort_handler('name desc');
      name.icon = <i className="material-icons">arrow_upward</i>;
      break;
    case 'name desc':
      name.css_class = name.css_class + ' blue white-text';
      name.on_submit = sort_handler(null);
      name.icon = <i className="material-icons">arrow_downward</i>;
      break;
    case 'value asc':
      value.css_class = value.css_class + ' blue white-text';
      value.on_submit = sort_handler('value desc');
      value.icon = <i className="material-icons">arrow_upward</i>;
      break;
    case 'value desc':
      value.css_class = value.css_class + ' blue white-text';
      value.on_submit = sort_handler(null);
      value.icon = <i className="material-icons">arrow_downward</i>;
      break;
    case 'last_logged asc':
      last_logged.css_class = last_logged.css_class + ' blue white-text';
      last_logged.on_submit = sort_handler('last_logged desc');
      last_logged.icon = <i className="material-icons">arrow_upward</i>;
      break;
    case 'last_logged desc':
      last_logged.css_class = last_logged.css_class + ' blue white-text';
      last_logged.on_submit = sort_handler(null);
      last_logged.icon = <i className="material-icons">arrow_downward</i>;
      break;
    default:
      break;
  }

  return (
    <ul className={item_sort ? `sort_options ${item_sort}` : 'sort_options'}>
      {sort_options.map((o, i) => (
        <li className={o.css_class} onClick={o.on_submit} key={i}>
          {o.text}
        </li>
      ))}
    </ul>
  );
};
