// Sort transactions by category

export const SORT_CATEGORIES = {
  date: 'date',
  value: 'value',
  description: 'description',
};

export const MODIFY_SORT_CATEGORY = 'MODIFY_SORT_CATEGORY';
export const modifySortCategory = category => ({
  type: MODIFY_SORT_CATEGORY,
  category,
});

// Change sorting order

export const SORT_ORDERS = {
  asc: 'asc',
  desc: 'desc',
};

export const MODIFY_SORT_ORDER = 'MODIFY_SORT_ORDER';
export const modifySortOrder = order => ({
  type: MODIFY_SORT_ORDER,
  order,
});


