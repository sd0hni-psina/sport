export function exportToCSV(filename: string, headers: string[], rows: string[][]) {
  const BOM = '\uFEFF'

  function escapeCell(value: string): string {
    // экранируем кавычки и точки с запятой
    const escaped = value.replace(/"/g, '""')
    if (escaped.includes(';') || escaped.includes('"') || escaped.includes('\n')) {
      return `"${escaped}"`
    }
    return `"${escaped}"`
  }

  const csvContent = [
    headers.map(escapeCell).join(';'),
    ...rows.map(row => row.map(escapeCell).join(';')),
  ].join('\n')

  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}