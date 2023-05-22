# 👋 The shared-routes library

Shared-routes is a TypeScript library designed to simplify and standardize route creation between services. Particularly useful in a monorepo environment, shared-routes allows you to manage route definitions as a shared library, accessible by any service.

In today's development environment, ensuring the correctness of route paths when calling routes from a frontend can be challenging. While tools like [GraphQL](https://graphql.org) and [tRPC](https://trpc.io) can aid in this process, they often require significant changes to the codebase and a maintenance of a separate schema or definitions.

Enter shared-routes. This library uniquely defines REST endpoints, doing so with a commitment to ease of use, familiarity, and leveraging commonly used tools. It enhances popular tools such as Express, Axios, Fetch API, OpenAPI, and Supertest by adding type safety and validations.

### Features:

* **Single Definition**: Create a unique, standardized definition for your REST endpoints, reducing inconsistencies and errors.
* **Express Integration**: Easily build your backend with Express using the shared-routes definitions.
* **Testing with Supertest**: Test your routes directly using shared-routes with Supertest.
* **API Calls**: Use Fetch API or Axios to make calls from a frontend or another service using the shared-routes definitions.
* **Swagger Documentation**: Generate OpenAPI (Swagger) documentation directly from your route definitions.
* **Type Safety**: Any changes in the route definitions will break the contract wherever it is used, thanks to TypeScript. This ensures that any updates to the definitions will be reflected across all services, increasing maintainability and reducing bugs.

With shared-routes, we aim to provide a user-friendly interface for defining and managing your service routes, all the while ensuring type safety and validation.



A full exemple of [a monorepo using pnpm workspaces can be found here](https://github.com/JeromeBu/shared-routes-demo).



