import { useCounterStore } from '../stores/counterStore';

export default function Test() {
  const { count } = useCounterStore();

  return (
    <div>
      <h1>Count: {count}</h1>
    </div>
  );
}
