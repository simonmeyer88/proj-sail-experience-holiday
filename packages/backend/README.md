# @aula-anclademia/backend

The backend package is a monolith NestJS application that exposes a REST API with different endpoints and a Socket.io gateway for the realtime chat feature.
The package depends on @aula-anclademia/common, so make sure that package is built before this one.
You can use the build:common script to build the common package.
The build script will build the package and generate a dist folder with the compiled code, but will not build the common package.

Some approaches include:

- Folder organization: NestJS recommended way: dividing the app in modules, and have related code living inside each module. File types include .controller, .service, .dto, .module, .decorator, .middleware, .interceptor, .guard, .pipe, .interception-filter, .event-handler(handle event-emitter events)
- Validation/request DTOs: class-validator and class-transformer, with a global validation pipe.
- Rate limiting: using NestJS's throttler.
- Internationalization: available in 'es' and 'en' locales. The backend is responsible for translating errors that are designed to be seen in the UI. It uses a custom header 'x-lang' to choose the language, and it defaults to english. It is powered by the nestjs-i18n package. JSON files with translations can be found in src/i18n. We have a custom http exception filter that translates error messages. For example, `throw new BadRequestException('auth.SOMETHING_HERE')` will get automatically translated by the exception filter given that there is a translation aviable in the JSON files.

This package depends on **@aula-anclademia/common**, so make sure that package is built before this one.

The architecture is the usual NestJS architecture, with some customizations:

- Controllers handle the request/response cycle. They are responsible for validating the request, and calling the appropriate service.
- Services are responsible for handling the business logic. They are responsible for calling the appropriate repositories, and returning the data to the controller.
- Gateways are like controllers, but for websockets. They are responsible for validating the request, and calling the appropriate service.
- DB is accesed directly from a DatabaseService, which is a wrapper around the Prisma client. This is done to avoid having to import the Prisma client in every service.
- Cron files are used to schedule tasks. They are responsible for calling the appropriate service.
- The app uses an event emitter to emit events. Event handler classes are responsible for handling those events. Usually event handlers are in their own domain, that means, the whatever.event-handler.ts file is in the same folder as the whatever.service.ts file, and it's responsible for catching events related to the whatever domain.

## External interactions outside frontend API calls

- **Emails**: an email module is provided. It uses the Sendinblue(Brevo) API to send different emails. All the templates are stored locally in the src/email/templates folder as raw html. Then, raw parameters are passed to the Brevo API and they are responsible for rendering the final email. More information can be found at [Brevo/Sendinblue documentation](https://developers.brevo.com/reference/sendtransacemail).

- <del>**Stripe**: each user has payments associated to them. Those payments can be introduced manually by an admin. They are also fetched once a day from the Stripe API and loaded into our database, by using a the @nestjs/schedule package.</del> Stripe integration is not active right now, but implemented and was working when it was on.

- **Zoom**: there is a ZoomMeeting table in the backend that stores active meetings (right now it is designed so ONLY 1 meeting is stored at a time). The feature is managed using Zoom webhooks. This information is consumed by the frontend directly.

- **Woocommerce**: there is a Woocommerce module that is responsible for fetching orders from the Woocommerce API. It is used to fetch orders from the Woocommerce store, get customer emails and order information and store it in the database. It is similar to the Stripe module, but with Woocommerce.

## API Documentation

Uses swagger to generate API documentation. It can be found at `/docs` endpoint. It is automatically generated from the code using the `@nestjs/swagger` package. More information can be found at [NestJS Swagger documentation](https://docs.nestjs.com/openapi/introduction).

## File storage

To store files, the app uses an S3-compatible product (as of now, Cloudflare R2, but should be replaceable with other S3-compatible APIs). 2 buckets are used: one private and one public. The public one is for user and group pictures, while the private one is used for the app's File system(on the src/file-system folder). Downloads are made with signed URLs, and uploads are made by uploading directly to an endpoint, then the server stores the file if appropiate.

## Authentication/Authorisation

Authorisation is done via stateless JWT stored in a httpOnly cookie. To check login status, the /users/me endpoint can be used. It will return user info if there is a valid session and a 401 error otherwise.

The session has a validity of 3 days and is automatically refreshed on every request. This means an user that has gone offline for more than 3 day will be logged out.

**CSRF Protection**: To ensure CSRF protection, ALL requests to the server must include a 'x-csrf-protection' header by following the `Custom Request Headers` pattern. The value is irrelevant. More information can be found on the [Owasp CSRF Protection Cheatsheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html).

## Database / Persistence layer

The app is designed to use a MySQL database, powered by the Prisma ORM. The database schema is defined in the prisma/schema.prisma file. The schema is then used to generate the Prisma client, which is used to interact with the database.

More information about different entities can be found in the schema.prisma file. Using https://prisma-editor.vercel.app/ is recommended to visualize the schema.

## Localisation

Localisation is done with the help of the nestjs-i18n package. Exceptions are translated using a custom exception filter located in `src/common`, and json localisation files are located in `src/i18n`. The default language is english, and it can be changed by using the `x-lang` header.

## Event emitter

The app uses an event emitter to emit events. Event handler classes are responsible for handling those events. The src/events folder defines all the possible events to be sent, and each domain has its own event handler class where it makes sense. They are used to send emails, send notifications, etc on actions like user acceptance, user onboarding, new calendar events published, etc.

## Logging

We use LogSnag for logging when necessary. More information can be found at [LogSnag documentation](https://docs.logsnag.com/). It is not used often, but sometimes was used for debuggin production issues. Can be controlled with the env variables.

## Environment variables

Everything you'll need to run and configure the app is in the .env.example file. You can copy it to a .env file and fill in the values. The .env file is gitignored, so it won't be commited to the repository.

## Testing

NestJS has built-in testing utils. So we use that + Jest for tests.

## More

Some more complicated modules have their own README.md file, where you can find more information about them.
