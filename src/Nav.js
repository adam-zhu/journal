import React from 'react';
import { Link } from 'react-router-dom';

const noop = () => {
  return;
};
const Nav = ({ open, active, nav_close_handler }) => {
  return (
    <nav className={open ? 'open' : ''}>
      <ul>
        <li
          className={active && active === 'home' ? 'active' : ''}
          onClick={active && active === 'home' ? nav_close_handler : noop}
        >
          <Link to="/journal">
            <i className="material-icons">home</i> Home
          </Link>
        </li>
        <li
          className={active && active === 'items' ? 'active' : ''}
          onClick={active && active === 'items' ? nav_close_handler : noop}
        >
          <Link to="/journal/items">
            <i className="material-icons">list</i> Items
          </Link>
        </li>
        <li
          className={active && active === 'create_item' ? 'active' : ''}
          onClick={active && active === 'create_item' ? nav_close_handler : noop}
        >
          <Link to="/journal/create_item">
            <i className="material-icons">playlist_add</i> Create Item
          </Link>
        </li>
        <li
          className={active && active === 'overview' ? 'active' : ''}
          onClick={active && active === 'overview' ? nav_close_handler : noop}
        >
          <Link to="/journal/overview">
            <i className="material-icons">dashboard</i> Overview
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Nav;
