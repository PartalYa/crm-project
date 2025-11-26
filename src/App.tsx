import { Link } from 'react-router-dom';
import { useCounterStore } from './stores/counterStore';

function App() {
  const { count, increment } = useCounterStore();

  return (
    <>
      {' '}
      <div className="flex flex-col gap-4">
        <Link to="/orders">Orders</Link>
        <Link to="/datepicker-test">DatePicker Test</Link>
      </div>
    </>
  );
}

export default App;
