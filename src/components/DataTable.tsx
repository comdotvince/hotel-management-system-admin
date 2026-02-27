import type { ReactNode } from 'react'

export type DataTableColumn<RowType> = {
  key: string
  header: string
  cell: (row: RowType) => ReactNode
  className?: string
}

type DataTableProps<RowType> = {
  columns: DataTableColumn<RowType>[]
  rows: RowType[]
  getRowKey: (row: RowType) => string | number
  emptyMessage: string
  onRowClick?: (row: RowType) => void
}

function DataTable<RowType>({
  columns,
  rows,
  getRowKey,
  emptyMessage,
  onRowClick,
}: DataTableProps<RowType>) {
  return (
    <div className="hms-table-wrap">
      <table className="hms-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.header}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.length ? (
            rows.map((row) => (
              <tr
                key={getRowKey(row)}
                className={onRowClick ? 'hms-table-row-clickable' : ''}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((column) => (
                  <td key={column.key} className={column.className}>
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td className="hms-table-empty" colSpan={columns.length}>
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default DataTable
