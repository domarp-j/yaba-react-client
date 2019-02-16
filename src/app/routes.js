// TODO: update transaction routes when routes.rb is more RESTful

const server = process.env.REACT_APP_SERVER;

export default {
  addTransactionTag: transactionId => `${server}/api/transaction-items/${transactionId}/tags`,
  deleteTransaction: `${server}/api/transaction-item/delete`,
  deleteTransactionTag: transactionId => `${server}/api/transaction-items/${transactionId}/tags/delete`,
  downloadCsv: `${server}/api/transaction-items/csv`,
  homePage: '/',
  signIn: `${server}/auth/sign_in`,
  signInPage: '/sign-in',
  signUp: `${server}/auth`,
  signUpPage: '/sign-up',
  tags: `${server}/api/tags`,
  transactions: `${server}/api/transaction-items`,
  transactionsPage: '/transactions',
  updateTransaction: `${server}/api/transaction-item/update`,
  updateTransactionTag: transactionId => `${server}/api/transaction-items/${transactionId}/tags/update`,
};
