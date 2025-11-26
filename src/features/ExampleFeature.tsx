// Example usage of react-hook-form, zod, react-phone-number-input, react-query, TanStack Table, react-window, date-fns, zustand
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { useQuery } from '@tanstack/react-query'
import { useCounterStore } from '../stores/counterStore'
import { format } from 'date-fns'
import { useMemo } from 'react'
import { useTable, ColumnDef, getCoreRowModel } from '@tanstack/react-table'
import { FixedSizeList as List } from 'react-window'

const schema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
})

type FormData = z.infer<typeof schema>

export function ExampleFeature() {
  const { count, increment, decrement } = useCounterStore()
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  // Example: react-query
  const { data, isLoading } = useQuery({
    queryKey: ['date'],
    queryFn: async () => format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
  })

  // Example: TanStack Table
  const columns = useMemo<ColumnDef<FormData>[]>(() => [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'phone', header: 'Phone' },
  ], [])
  const table = useTable({
    data: [{ name: 'John', phone: '+123456789' }],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  // Example: react-window
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>{table.getRowModel().rows[index]?.getValue('name')}</div>
  )

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Example Feature</h2>
      <form onSubmit={handleSubmit(console.log)} className="space-y-2">
        <input {...register('name')} placeholder="Name" className="border p-1" />
        {errors.name && <span className="text-red-500">Name required</span>}
        <PhoneInput
          defaultCountry="US"
          onChange={val => setValue('phone', val || '')}
          className="border p-1"
        />
        {errors.phone && <span className="text-red-500">Phone required</span>}
        <button type="submit" className="bg-indigo-600 text-white px-2 py-1 rounded">Submit</button>
      </form>
      <div>Counter: {count} <button onClick={increment}>+</button> <button onClick={decrement}>-</button></div>
      <div>Current date (from react-query): {isLoading ? 'Loading...' : data}</div>
      <div className="border p-2">
        <h3>Table (TanStack Table + react-window)</h3>
        <List
          height={50}
          itemCount={table.getRowModel().rows.length}
          itemSize={24}
          width={300}
        >
          {Row}
        </List>
      </div>
    </div>
  )
}
