---
description: The Express adapter, type safe
---

# Express

### Example

```typescript
import express from "express";
import bodyParser from "body-parser";
import { createExpressSharedRouter } from "shared-routes/express";

const createRouter = (): express.Router => {
  const expressRouter = express.Router();

  const { expressSharedRouter } = createExpressSharedRouter(
    bookRoutes,
    expressRouter
  );

  expressSharedRouter.addBook((req, res) => {
    req.body; // type is { title: string, author: string } (matches the requestBodySchema)
    res.json({ bookId: 123 }); // type is { bookId: number } (matches the responseBodySchema)
  });

  expressSharedRouter.getBooks((req, res) => {
    req.query; // type is { titleContains?: string, authorContains?: string } (matches the queryParamsSchema)
    res.json([{ id: "abc", title: "Harry Potter", author: "JK Rowling" }]); // type is Book[] (matches the responseBodySchema)
  });

  expressSharedRouter.getBookById((req, res) => {
    req.params; // type is { bookId: string } (matches the :bookId path param)
    res.json({ id: "abc", title: "Harry Potter", author: "JK Rowling" }); // type is Book | undefined (matches the responseBodySchema)
  });

  return expressRouter;
};

const app = express();
app.use(bodyParser.json());
app.use(createRouter());

app.listen(3000, () => {
  console.log("server started");
});
```
