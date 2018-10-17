# yaba (Yet Another Budget App) - React Client

The React front-end for yaba, a simple but intuitive budgeting app.

Check out yaba at [yaba.netlify.com](https://yaba.netlify.com)!

## Setup

Follow the setup instructions on the [yaba-infrastructure](https://github.com/domarp-j/yaba-infrastructure) README. This will set up all of the services needed to get yaba running.

## Running Commands

- After setup, go to your `yaba-infrastructure` directory
- Run `docker-compose run react-client bash` to bash into the `yaba-react-client` container
- Run commands as needed (i.e. the static analysis & testing commands below)

## Static Analysis & Testing

- ESLint `yarn lint`
- Jest `yarn test`

## Styling

This app uses [node-sass](https://www.npmjs.com/package/node-sass) to compile Sass files into `css` files. If you are making any style changes:

- Open up a new terminal
- Bash into the `yaba-react-client` container (see Running Commands section)
- Run `yarn sass:watch` so that changes to Sass files are automatically registered

Important note: If you add any Sass files to the `src/app/components` directory, run `yarn sass:build`. Doing so will run a script that automatically adds the necessary imports to the main `index.scss` file.

## Deploys

Updates to the master branch are automatically deployed to [Netlify](https://www.netlify.com/).
