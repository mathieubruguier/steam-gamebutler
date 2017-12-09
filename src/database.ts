const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
import { Winston } from './winston';

export interface UserInformation {
    steamId: number;
    conversationState: number;
    region: string;
    discord: string;
}

export class Database {
    public static adapter: any;
    public static db: any;

    public static initialize(): void {
        Winston.logger.info('⏲️  Initializing database...');
        this.adapter = new FileSync('db.json');
        this.db = low(this.adapter);

        this.db.defaults({ users: []})
            .write()
        Winston.logger.info('✔️  Database initialized successfully.');
    }

    public static getUser(userId: number): any {
        const value = this.db.get('users')
            .find({ id: userId })
            .value()

        return value;
    }

    public static saveUser(userId: number, userInfo: UserInformation): void {
        this.db.get('users')
            .push(userInfo)
            .last()
            .assign({ id: userId })
            .write();
    }
}
