const getStatusColor = (status: string) => {
  switch (status) {
    case 'Open':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    case 'In Progress':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    case 'Resolved':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    case 'Closed':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
  }
}
export default getStatusColor
