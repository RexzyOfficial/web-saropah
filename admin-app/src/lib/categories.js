export const CATEGORIES = ['coffee-basic', 'coffee-signature', 'milkshake', 'tea', 'food']

export const formatCategory = (category) =>
  category
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
