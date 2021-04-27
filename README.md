# Open Timber Portal

-   Landing: http://www.opentimberportal.org
-   App: http://otp.vizzuality.com/

## Running locally in development mode

To get started in development mode:

1. Clone the repository.
2. Install dependencies with `npm install` or `yarn`.
3. Generate the required `lang` folder with `npm run transifex:pull`. In case you didn't read this, it's built into the `dev` command.
4. Copy the `.env.default` file into `.env` (ask for the app keys).
5. Run the development server with `npm run dev`.

## Building and deploying in production

If you wanted to run this site in production run:

    npm install
    npm run build
    npm start

You should run the the build step again any time you make changes to pages or
components.

## Deploy landing

    git push heroku landing:master

## Deploy app

    // PRODUCTION
    git push deploy master

    // STAGING
    git push staging develop
