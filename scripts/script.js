const { useState, useCallback, useEffect } = React;


const Input = React.memo(({ type, label, name, value, onChange, ...rest }) => (
  <div>
    <label>{label}</label>
    <br />
    <input type={type} name={name} value={value} onChange={ev => onChange(ev.target.value)} {...rest} />
  </div>
));
Input.defaultProps = { type: 'text' };

const Form = (props) => {
  const [descr, onDescrChange] = useState(props.descr);
  const [date, onDateChange] = useState(props.date);
  const onLocalSubmit = useCallback((e) => {
    e.preventDefault();
    props.onSubmit({ descr, date });
    onDescrChange('');
    onDateChange('');
  }, [descr, date]);
  const onCancel = () => {
    onDescrChange('');
    onDateChange('');
    props.onCancel();
  };
  return (
    <form onSubmit={onLocalSubmit}>
      <h3>{props.title}</h3>
      <Input name="descr" onChange={onDescrChange} value={descr} label="Description" required />
      <Input name="date" onChange={onDateChange} value={date} label="Date" type="date" required />
      <button type="submit">Save</button>
      <button type="reset" onClick={onCancel}>Cancel</button>
    </form>
  );
};
Form.defaultProps = { descr: '', date: '', onSubmit: () => {} };

const ListItem = ({ item, onEdit, onDelete }) => (
  <li>
    <button onClick={() => onEdit(item)}>&#10000;</button>&nbsp;|&nbsp;
    <button onClick={() => onDelete(item)}>&#128465;</button>&nbsp;|&nbsp;
    <span>{item.date} | {item.descr}</span>
  </li>
);

const List = ({ list, onEdit, onDelete }) => (
  <ul>
    {list.map((it) =>
      <ListItem
        key={it.date}
        item={it}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )}
  </ul>
);

const Maybe = ({ component: Component, visible, ...rest }) => (
  visible
    ? <Component {...rest} />
    : null
);

const getInitialFormData = () => ({ descr: '', date: '' });
const getLocalStore = () =>
  JSON.parse(localStorage.getItem('holidays') || "{}");
const setLocalStore = (data) =>
  localStorage.setItem('holidays', JSON.stringify(data));

const App = () => {
  const [list, onListChange] = useState(getLocalStore);
  const [item, onItemChange] = useState(getInitialFormData);
  const [mode, onModeChange] = useState('add');
  useEffect(() => {
    setLocalStore(list);
  }, [list]);
  const onEdit = (item) => {
    onItemChange(item);
    onModeChange(item.date);
  };
  const onDelete = (item) => {
    const isConfirmed = confirm(`Are you sure to delete the item: ${item.date} | ${item.descr}?`);
    if (isConfirmed) {
      onListChange((xs) =>
        Object.keys(xs)
          .reduce(
            (acc, key) => key === item.date ? acc : { ...acc, [key]: xs[key] },
            {}
          )
      );
      onItemChange(getInitialFormData);
      onModeChange('add');
    }
  };
  const onSubmit = (eitem) => {
    onListChange((xs) => ({ ...xs, [eitem.date]: eitem }));
    onItemChange(getInitialFormData);
    onModeChange('add');
  };
  const onCancel = () => {
    onItemChange(getInitialFormData);
    onModeChange('add');
  };
  return (
    <div>
      <h2>Holidays CRUD</h2>
      <div>
        <Maybe
          onSubmit={onSubmit}
          onCancel={onCancel}
          visible={mode === 'add'}
          component={Form}
          title="Add"
          {...item}
        />
        <Maybe
          key={mode}
          onSubmit={onSubmit}
          onCancel={onCancel}
          visible={mode !== 'add'}
          component={Form}
          title="Edit"
          {...item}
        />
        <List
          list={Object.values(list)}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
};


ReactDOM.render(
  <App />,
  document.getElementById('root')
);