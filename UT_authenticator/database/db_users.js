"use strict";

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');

const info_field = 'db_info';

class db_user {
    constructor(database_file) {

        const file = path.join(__dirname, '..', database_file);

        const adapter = new FileSync(file);
        this.db = low(adapter);

        this.db.defaults({
            [info_field]: { SID: 0 },
            users: {}
        }).write();
    }

    async fn_add_record(user_email, user_data, fn_callback) {
        if (!user_data || user_email === info_field) return;
        if (!user_data.sid || !user_data.pwd || !user_data.prm) return;

        user_data.isadmin = user_data.isadmin ?? false;

        const exists = this.db.get("users").has(user_email).value();
        if (exists) {
            let c_reply = {};
            c_reply[global.c_CONSTANTS.CONST_ERROR_MSG] = "Duplicate entry.";
            c_reply[global.c_CONSTANTS.CONST_ERROR] = global.c_CONSTANTS.CONST_ERROR_DATA_DATABASE_ERROR;
            if (fn_callback) fn_callback(c_reply);
            return;
        }

        this.db.get("users").set(user_email, user_data).write();

        let c_reply = {};
        c_reply[global.c_CONSTANTS.CONST_ERROR.toString()] = global.c_CONSTANTS.CONST_ERROR_NON;
        if (fn_callback) fn_callback(c_reply);
    }

    async fn_update_record(user_email, user_data, fn_callback) {
        if (!user_data || user_email === info_field) return;
        if (!user_data.sid || !user_data.pwd || !user_data.prm) return;

        user_data.isadmin = user_data.isadmin ?? false;

        const exists = this.db.get("users").has(user_email).value();
        if (!exists) {
            let c_reply = {};
            c_reply[global.c_CONSTANTS.CONST_ERROR_MSG] = "Account Not Found.";
            c_reply[global.c_CONSTANTS.CONST_ERROR] = global.c_CONSTANTS.CONST_ERROR_ACCOUNT_NOT_FOUND;
            if (fn_callback) fn_callback(c_reply);
            return;
        }

        this.db.get("users").set(user_email, user_data).write();

        let c_reply = {};
        c_reply[global.c_CONSTANTS.CONST_ERROR.toString()] = global.c_CONSTANTS.CONST_ERROR_NON;
        if (fn_callback) fn_callback(c_reply);
    }

    fn_get_keys() {
        return Object.keys(this.db.get("users").value());
    }

    async fn_delete_record(key) {
        if (key === info_field) return;
        this.db.get("users").unset(key).write();
    }

    fn_get_record(key) {
        return this.db.get(`users.${key}`).value() || null;
    }

    fn_get_all_users() {
        const users = this.db.get("users").value();
        return Object.fromEntries(
            Object.entries(users).filter(([_, user]) => user.isadmin === false)
        );
    }

    fn_get_user_by_accesscode(accesscode) {
        const users = this.db.get("users").value();
        for (const [email, user] of Object.entries(users)) {
            if (user.pwd === accesscode) return { ...user, acc: email };
        }
        return null;
    }

    fn_get_users_by_sid(sid) {
        const users = this.db.get("users").value();
        const result = {};
        for (const [email, user] of Object.entries(users)) {
            if (user.sid === sid) result[email] = user;
        }
        return result;
    }

    async fn_sync_to_disk() {
        // lowdb writes automatically, no-op preserved for compatibility
        this.db.write();
    }
}

module.exports = { db_user };
