// TODO: update transaction routes when routes.rb is more RESTful

const server = process.env.REACT_APP_SERVER;

export default {
  homePage: '/',
  signUpPage: '/sign-up',
  signInPage: '/sign-in',
  signUp: `${server}/auth`,
  signIn: `${server}/auth/sign_in`,
  transactions: `${server}/api/transaction-items`,
  updateTransaction: `${server}/api/transaction-item/update`,
  deleteTransaction: `${server}/api/transaction-item/delete`,
  addTransactionTag: transactionId => `${server}/api/transaction-items/${transactionId}/tags`,
  updateTransactionTag: transactionId => `${server}/api/transaction-items/${transactionId}/tags/update`,
  deleteTransactionTag: transactionId => `${server}/api/transaction-items/${transactionId}/tags/delete`,
  downloadCsv: `${server}/api/transaction-items/csv`,
};
