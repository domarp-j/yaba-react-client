# yaba (Yet Another Budget App) - React Client

The React front-end for yaba, a simple but intuitive budgeting app.

Check it out at [yaba.netlify.com](https://yaba.netlify.com)!

## Setup

Follow the setup instructions on `yaba-infrastructure`'s README. This will set up all of the services needed (including this one) to get the app running.

Note: You will have to prepend app-specific commands with `docker-compose run react-client`. To make life less tedious, you can run `docker-compose run react-client bash` and run commands as normal from within the `react-client` container

## Static Analysis & Testing

- ESLint `docker-compose run react-client yarn lint`
- Jest `docker-compose run react-client yarn test`

## Deploys

Updates to the master branch are automatically deployed to [Netlify](https://www.netlify.com/).
