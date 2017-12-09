"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var low = require('lowdb');
var FileSync = require('lowdb/adapters/FileSync');
var Database = /** @class */ (function () {
    function Database() {
    }
    Database.initialize = function () {
        this.adapter = new FileSync('db.json');
        this.db = low(this.adapter);
        this.db.defaults({ posts: [], user: {} })
            .write();
        this.db.get('posts')
            .push({ id: 1, title: 'lowdb is awesome' })
            .write();
    };
    return Database;
}());
exports.Database = Database;
//# sourceMappingURL=database.js.map