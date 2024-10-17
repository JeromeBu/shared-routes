var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { z } from "zod";
import { describe, it, expect } from "vitest";
import { defineRoute, defineRoutes, createCustomSharedClient } from "../src/index.mjs";
var bookSchema = z.object({
    title: z.string(),
    author: z.string(),
});
var withAuthorizationSchema = z.object({ authorization: z.string() });
var myRoutes = defineRoutes({
    addBook: defineRoute({
        method: "post",
        url: "/books",
        requestBodySchema: bookSchema,
        headersSchema: withAuthorizationSchema,
    }),
    getAllBooks: defineRoute({
        method: "get",
        url: "/books",
        queryParamsSchema: z.object({ max: z.number() }),
        responses: { 200: z.array(bookSchema) },
    }),
    getByTitle: defineRoute({
        method: "get",
        url: "/books/:title",
        responses: { 200: bookSchema.optional() },
    }),
});
// const books: Book[] = [];
var createTestHttpClient = function () {
    var books = [];
    return createCustomSharedClient(myRoutes, {
        addBook: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
            var body = _b.body;
            return __generator(this, function (_c) {
                books.push(body);
                return [2 /*return*/, { status: 201, body: undefined, headers: {} }];
            });
        }); },
        getAllBooks: function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, ({
                        status: 200,
                        body: books,
                        headers: {},
                    })];
            });
        }); },
        getByTitle: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
            var title = _b.urlParams.title;
            return __generator(this, function (_c) {
                return [2 /*return*/, ({
                        status: 200,
                        body: books.find(function (book) { return book.title.toLowerCase().includes(title.toLowerCase()); }),
                        headers: {},
                    })];
            });
        }); },
    });
};
var httpClient = createTestHttpClient();
describe("createCustomSharedClient", function () {
    it("all routes work fine", function () { return __awaiter(void 0, void 0, void 0, function () {
        var myBook, response, allBooks, fetchedBook;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    myBook = { title: "Harry Potter", author: "J.K. Rowling" };
                    return [4 /*yield*/, httpClient.addBook({
                            body: myBook,
                            headers: { authorization: "my-token" },
                        })];
                case 1:
                    response = _a.sent();
                    expect(response.status).toBe(201);
                    expect(response.body).toBe(undefined);
                    return [4 /*yield*/, httpClient.getAllBooks({
                            queryParams: { max: 12 },
                        })];
                case 2:
                    allBooks = (_a.sent()).body;
                    expect(allBooks).toEqual([myBook]);
                    return [4 /*yield*/, httpClient.getByTitle({
                            urlParams: { title: "potter" },
                        })];
                case 3:
                    fetchedBook = (_a.sent()).body;
                    expect(fetchedBook).toEqual(myBook);
                    return [2 /*return*/];
            }
        });
    }); });
});
//# sourceMappingURL=createCustomSharedClient.test.mjs.map