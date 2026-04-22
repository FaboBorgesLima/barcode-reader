import { User } from "../../../model/user";

export class UserView {
    displayUser(user: User): void {
        console.log(`\n  ID:    ${user.id}`);
        console.log(`  Name:  ${user.name}`);
        console.log(`  Email: ${user.email}`);
    }

    displayUpdated(user: User): void {
        console.log("\n  User updated:");
        this.displayUser(user);
    }

    displayError(message: string): void {
        console.error(`\n  Error: ${message}`);
    }
}
