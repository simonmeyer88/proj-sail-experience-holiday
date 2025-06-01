# Aula anclademia - Public calendar (frontend)

Vue3 and Vite project to display a public calendar.
Simply calls the Anclademia events API and displays the events in a calendar, using full-calendar.
Depending on the URL param 'courseId', it will filter the events to only show the events for that course.
The 'CLUB' course id can be used to display club events.

## Project setup (for development)

- Create a `.env` file in the root of the project with the following content:

```
VITE_APP_API_URL=...
```

- Install dependencies

```
npm install
```

- Run the project

```
npm run dev
```

## Deployment

- Build the project

```
npm run build
```

This will produce a `dist` folder with the built project, with a `index.html` file just under the `dist` folder. This is the file that should be served by the web server.
The `dist` folder also includes other assets, such as the compiled JS and CSS files, images, etc.

## Usage

The project is designed to be used as a standalone frontend for showing Anclademia's public calendar information.
It is designed to be embedded as an iframe (it's main purpose is to be embedded in the Anclademia website), to show off the different events available.

The URL in the browser should be {BASE_URL}?courseId={courseId}, where {BASE_URL} is the URL where the project is hosted, and {courseId} is the id of the course to filter the events by. It can be the ID of any Anclademia's course, or 'CLUB' to show club events.
