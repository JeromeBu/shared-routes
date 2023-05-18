# 👋 About this lib

This library is meant to make building routes between services much more dev friendly and to have a strong interface contract taking advantage of typescript types.

It will be particularly use full in a monorepo, where the routes definition will be able to be shared as a library that any service can use.

When writing calling routes from a frontend, it is usually quite a pain to make sure that the routes are correct. There are some tools that can help for that for exemple :

* [GraphQL](https://graphql.org) for exemple, but it requires a lot of change in a code base, and there is a need to maintain a schema in the graphql schema.&#x20;
* [tRPC](https://trpc.io) which is probably the best choice, when using typescript only to share definitions between a backend and a frontend.

Shared-routes aims to be a unique definition for REST endpoints. But it relise on usual tools like express, axios, fetchAPI, openApi or supertest.

This library brings type safety and validations to those tools.&#x20;

From the routes definitions you can :&#x20;

* Create your backend with express
* Test your routes with supertest
* Call it from a frontend or from another service with the fetch API or axios
* Générate an OpenAPI (swagger) documentation

