const add_entry_for_item = db => async item => {
  const entry_model = {
    date: Date.now(),
    item: {
      key: item.key,
      name: item.name,
      value: item.value,
      created_date: item.created_date
    }
  };

  return await db.ref('log').push(entry_model);
};

const create_item = db => async item_model => await db.ref('items').push(item_model);

const create_item_and_add_entry = db => async item_model => {
  if (
    !item_model ||
    !item_model.name ||
    !item_model.value ||
    !item_model.created_date ||
    !item_model.active
  ) {
    return alert('item_model must have properties { name, value, created_date, active }');
  }

  const new_item_ref = db.ref('items').push();
  const new_entry_ref = db.ref('log').push();
  const new_item_key = new_item_ref.key;
  const new_entry_key = new_entry_ref.key;
  const entry_model = {
    date: item_model.created_date,
    active: item_model.active,
    item: {
      key: new_item_key,
      name: item_model.name,
      value: item_model.value,
      created_date: item_model.created_date
    }
  };
  const batched_update_model = {
    [`items/${new_item_key}`]: item_model,
    [`log/${new_entry_key}`]: entry_model
  };

  return await db.ref().update(batched_update_model);
};

const deactivate_entry = db => async entry_key =>
  await db.ref(`log/${entry_key}`).update({ active: false });

export { add_entry_for_item, create_item, create_item_and_add_entry, deactivate_entry };
