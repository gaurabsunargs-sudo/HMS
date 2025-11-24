import { ColumnDef as TanstackColumnDef } from '@tanstack/react-table'

// Create a new type with the custom property
export type ColumnDef<TData, TValue = unknown> = TanstackColumnDef<
  TData,
  TValue
> & {
  initialHidden?: boolean
}
