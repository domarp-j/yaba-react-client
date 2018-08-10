// TODO: update transaction routes when routes.rb is more RESTful

export default {
  homePage: '/',
  signUpPage: '/sign-up',
  signInPage: '/sign-in',
  signUp: `${process.env.REACT_APP_SERVER}/auth`,
  signIn: `${process.env.REACT_APP_SERVER}/auth/sign_in`,
  transactions: `${process.env.REACT_APP_SERVER}/api/transaction-items`,
  updateTransaction: `${process.env.REACT_APP_SERVER}/api/transaction-item/update`,
  deleteTransaction: `${process.env.REACT_APP_SERVER}/api/transaction-item/delete`,
  tags: `${process.env.REACT_APP_SERVER}/api/tags`,
};
