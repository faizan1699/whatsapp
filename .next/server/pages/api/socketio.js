"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/api/socketio";
exports.ids = ["pages/api/socketio"];
exports.modules = {

/***/ "socket.io":
/*!****************************!*\
  !*** external "socket.io" ***!
  \****************************/
/***/ ((module) => {

module.exports = import("socket.io");;

/***/ }),

/***/ "(api)/./pages/api/socketio.ts":
/*!*******************************!*\
  !*** ./pages/api/socketio.ts ***!
  \*******************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var socket_io__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! socket.io */ \"socket.io\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([socket_io__WEBPACK_IMPORTED_MODULE_0__]);\nsocket_io__WEBPACK_IMPORTED_MODULE_0__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];\n\nconst SocketHandler = (req, res)=>{\n    if (!res.socket.server.io) {\n        const io = new socket_io__WEBPACK_IMPORTED_MODULE_0__.Server(res.socket.server);\n        res.socket.server.io = io;\n        io.on(\"connection\", (socket)=>{\n            console.log(\"New socket\", socket.id);\n            socket.on(\"message\", (msg)=>{\n                // Broadcast to others\n                socket.broadcast.emit(\"message\", msg);\n            });\n            socket.on(\"join-room\", (room)=>{\n                socket.join(room);\n            });\n            socket.on(\"group-message\", ({ room, message })=>{\n                socket.to(room).emit(\"message\", message);\n            });\n        });\n    }\n    res.end();\n};\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (SocketHandler);\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwaSkvLi9wYWdlcy9hcGkvc29ja2V0aW8udHMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBa0M7QUFHbEMsTUFBTUMsZ0JBQWdCLENBQUNDLEtBQVVDO0lBQy9CLElBQUksQ0FBQ0EsSUFBSUMsTUFBTSxDQUFDQyxNQUFNLENBQUNDLEVBQUUsRUFBRTtRQUN6QixNQUFNQSxLQUFLLElBQUlOLDZDQUFNQSxDQUFDRyxJQUFJQyxNQUFNLENBQUNDLE1BQU07UUFDdkNGLElBQUlDLE1BQU0sQ0FBQ0MsTUFBTSxDQUFDQyxFQUFFLEdBQUdBO1FBRXZCQSxHQUFHQyxFQUFFLENBQUMsY0FBYyxDQUFDSDtZQUNuQkksUUFBUUMsR0FBRyxDQUFDLGNBQWNMLE9BQU9NLEVBQUU7WUFDbkNOLE9BQU9HLEVBQUUsQ0FBQyxXQUFXLENBQUNJO2dCQUNwQixzQkFBc0I7Z0JBQ3RCUCxPQUFPUSxTQUFTLENBQUNDLElBQUksQ0FBQyxXQUFXRjtZQUNuQztZQUVBUCxPQUFPRyxFQUFFLENBQUMsYUFBYSxDQUFDTztnQkFDdEJWLE9BQU9XLElBQUksQ0FBQ0Q7WUFDZDtZQUVBVixPQUFPRyxFQUFFLENBQUMsaUJBQWlCLENBQUMsRUFBQ08sSUFBSSxFQUFFRSxPQUFPLEVBQUM7Z0JBQ3pDWixPQUFPYSxFQUFFLENBQUNILE1BQU1ELElBQUksQ0FBQyxXQUFXRztZQUNsQztRQUNGO0lBQ0Y7SUFDQWIsSUFBSWUsR0FBRztBQUNUO0FBRUEsaUVBQWVqQixhQUFhQSxFQUFBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vY2hhdC1hcHAvLi9wYWdlcy9hcGkvc29ja2V0aW8udHM/MjQxMiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBTZXJ2ZXIgfSBmcm9tICdzb2NrZXQuaW8nXG5pbXBvcnQgeyBOZXh0QXBpUmVxdWVzdCB9IGZyb20gJ25leHQnXG5cbmNvbnN0IFNvY2tldEhhbmRsZXIgPSAocmVxOiBhbnksIHJlczogYW55KSA9PiB7XG4gIGlmICghcmVzLnNvY2tldC5zZXJ2ZXIuaW8pIHtcbiAgICBjb25zdCBpbyA9IG5ldyBTZXJ2ZXIocmVzLnNvY2tldC5zZXJ2ZXIpXG4gICAgcmVzLnNvY2tldC5zZXJ2ZXIuaW8gPSBpb1xuXG4gICAgaW8ub24oJ2Nvbm5lY3Rpb24nLCAoc29ja2V0KSA9PiB7XG4gICAgICBjb25zb2xlLmxvZygnTmV3IHNvY2tldCcsIHNvY2tldC5pZClcbiAgICAgIHNvY2tldC5vbignbWVzc2FnZScsIChtc2cpID0+IHtcbiAgICAgICAgLy8gQnJvYWRjYXN0IHRvIG90aGVyc1xuICAgICAgICBzb2NrZXQuYnJvYWRjYXN0LmVtaXQoJ21lc3NhZ2UnLCBtc2cpXG4gICAgICB9KVxuXG4gICAgICBzb2NrZXQub24oJ2pvaW4tcm9vbScsIChyb29tKSA9PiB7XG4gICAgICAgIHNvY2tldC5qb2luKHJvb20pXG4gICAgICB9KVxuXG4gICAgICBzb2NrZXQub24oJ2dyb3VwLW1lc3NhZ2UnLCAoe3Jvb20sIG1lc3NhZ2V9KSA9PiB7XG4gICAgICAgIHNvY2tldC50byhyb29tKS5lbWl0KCdtZXNzYWdlJywgbWVzc2FnZSlcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuICByZXMuZW5kKClcbn1cblxuZXhwb3J0IGRlZmF1bHQgU29ja2V0SGFuZGxlclxuIl0sIm5hbWVzIjpbIlNlcnZlciIsIlNvY2tldEhhbmRsZXIiLCJyZXEiLCJyZXMiLCJzb2NrZXQiLCJzZXJ2ZXIiLCJpbyIsIm9uIiwiY29uc29sZSIsImxvZyIsImlkIiwibXNnIiwiYnJvYWRjYXN0IiwiZW1pdCIsInJvb20iLCJqb2luIiwibWVzc2FnZSIsInRvIiwiZW5kIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(api)/./pages/api/socketio.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__("(api)/./pages/api/socketio.ts"));
module.exports = __webpack_exports__;

})();