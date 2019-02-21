const { useState, useCallback, useEffect } = React;


const Input = React.memo(({ type, label, name, value, onChange, ...rest }) => (
  <div>
    <label>{label}</label>
    <input type={type} name={name} value={value} onChange={ev => onChange(ev.target.value)} {...rest} />
  </div>
));
Input.defaultProps = { type: 'text' };

const Form = (props) => {
  const [descr, onDescrChange] = useState(props.descr);
  const [date, onDateChange] = useState(props.date);
  const onLocalSubmit = useCallback((e) => {
    e.preventDefault();
    props.onSubmit({ descr, date, id: props.id });
    onDescrChange('');
    onDateChange('');
  }, [descr, date, props.id]);
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
      <div class="clearfix">
        <div class="float-right">
          <button class="button button-clear" type="reset" onClick={onCancel}>Cancel</button>
          <button type="submit">Save</button>
        </div>
      </div>
    </form>
  );
};
Form.defaultProps = { descr: '', date: '', onSubmit: () => {} };

const ListItem = ({ item, onEdit, onDelete }) => (
  <tr>
    <td>{item.date}</td>
    <td>{item.descr}</td>
    <td>
      <button
        class="button button-outline"
        onClick={() => onEdit(item)}
      >
        &#10000;
      </button>
      &nbsp;|&nbsp;
      <button
        class="button button-outline"
        onClick={() => onDelete(item)}
      >
        &#128465;
      </button>
    </td>
  </tr>
);

const List = ({ list, onEdit, onDelete }) => (
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Description</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {list.map((it) =>
        <ListItem
          key={it.id}
          item={it}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    </tbody>
  </table>
);

const Maybe = ({ component: Component, visible, ...rest }) => (
  visible
    ? <Component {...rest} />
    : null
);

function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
} 
const getInitialFormData = () => ({ descr: '', date: '', id: uuidv4() });
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
    onModeChange(item.id);
    window.scrollTo(0, 0);
  };
  const onDelete = (item) => {
    const isConfirmed = confirm(`Are you sure to delete the item: ${item.date} | ${item.descr}?`);
    if (isConfirmed) {
      onListChange((xs) =>
        Object.keys(xs)
          .reduce(
            (acc, key) => key === item.id ? acc : { ...acc, [key]: xs[key] },
            {}
          )
      );
      onItemChange(getInitialFormData);
      onModeChange('add');
    }
  };
  const onSubmit = (eitem) => {
    onListChange((xs) => ({ ...xs, [eitem.id]: eitem }));
    onItemChange(getInitialFormData);
    onModeChange('add');
  };
  const onCancel = () => {
    onItemChange(getInitialFormData);
    onModeChange('add');
  };
  return (
    <div class="container">
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