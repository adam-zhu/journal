import React from 'react';
import { Link } from 'react-router-dom';
const noop = () => {};

const Nav = ({ user, open, active, nav_close_handler, log_out_handler }) => {
  const name = (user || {}).displayName;
  const email = (user || {}).email;
  const photoUrl = (user || {}).photoURL;

  return (
    <nav className={open ? 'open' : ''}>
      <ul>
        <li
          className={active && active === 'home' ? 'nav_item active' : 'nav_item'}
          onClick={active && active === 'home' ? nav_close_handler : noop}
        >
          <Link to="/journal">
            <i className="material-icons">home</i> Home
          </Link>
        </li>
        <li
          className={active && active === 'items' ? 'nav_item active' : 'nav_item'}
          onClick={active && active === 'items' ? nav_close_handler : noop}
        >
          <Link to="/journal/items">
            <i className="material-icons">list</i> Items
          </Link>
        </li>
        <li
          className={active && active === 'overview' ? 'nav_item active' : 'nav_item'}
          onClick={active && active === 'overview' ? nav_close_handler : noop}
        >
          <Link to="/journal/overview">
            <i className="material-icons">dashboard</i> Overview
          </Link>
        </li>
        <li className="user">
          <div className="user_meta">
            <figure className="avatar" style={{ backgroundImage: `url(${photoUrl})` }} />
            <div className="text_meta">
              <span className="name" title={name}>
                {name}
              </span>
              <span className="email" title={email}>
                {email}
              </span>
            </div>
            <form className="cta log_out" onSubmit={log_out_handler}>
              <button className="btn btn-flat">Sign Out</button>
            </form>
          </div>
        </li>
      </ul>
    </nav>
  );
};

export default Nav;
