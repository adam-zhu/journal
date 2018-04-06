import React from "react";

const NewItemForm = ({ submit_handler, button_text }) => (
  <form className="add_new" onSubmit={submit_handler}>
    <div className="input-field col s8">
      <input id="name" type="text" className="validate" />
      <label htmlFor="name">Item</label>
    </div>
    <div className="input-field value col s4">
      <input id="value" type="text" className="validate" />
      <label htmlFor="value">Value</label>
    </div>
    <div className="cta col s12">
      <button className="btn-flat blue-text add_new waves-light">{button_text}</button>
    </div>
  </form>
);

export default NewItemForm;
