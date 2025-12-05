import { sendNotification, type Cron } from '../functions';
import { conn } from '../variables';

/**
 * Weekly presents summary cron job
 * Runs every Sunday at 20:00 (8 PM)
 * Sends a notification to each user with a summary of presents changes from the past week:
 * - New presents added by other users (potential gift ideas)
 * - Presents reserved by other users for them
 */
export default [
    '0 0 20 * * 0',
    async () => {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Get all users
        const users = await conn.selectFrom('user').select(['id', 'firstname']).execute();

        for (const user of users) {
            // Get new presents added by other users in the past week
            const newPresents = await conn
                .selectFrom('present')
                .innerJoin('user', 'user.id', 'present.user_id')
                .select([
                    'present.id',
                    'present.name',
                    'user.firstname as owner_firstname'
                ])
                .where('present.user_id', '!=', user.id)
                .where('present.created_at', '>=', oneWeekAgo)
                .where('present.state', '!=', 2) // Exclude already given presents
                .execute();

            // Get presents that belong to this user and were reserved by others this week
            const reservedPresents = await conn
                .selectFrom('present')
                .innerJoin('user', 'user.id', 'present.reserved_id')
                .select([
                    'present.id',
                    'present.name',
                    'user.firstname as reserver_firstname'
                ])
                .where('present.user_id', '=', user.id)
                .where('present.reserved_at', '>=', oneWeekAgo)
                .where('present.state', '>=', 1) // Reserved or given
                .execute();

            // Skip if no changes
            if (newPresents.length === 0 && reservedPresents.length === 0) {
                continue;
            }

            // Build notification message
            const messageParts: string[] = [];

            if (newPresents.length > 0) {
                const uniqueOwners = [
                    ...new Set(newPresents.map((p) => p.owner_firstname))
                ];
                messageParts.push(
                    `${newPresents.length} nových přání od: ${uniqueOwners.join(', ')}`
                );
            }

            if (reservedPresents.length > 0) {
                messageParts.push(
                    `${reservedPresents.length} tvých přání bylo zarezervováno`
                );
            }

            await sendNotification(user.id, {
                title: 'Týdenní přehled přání',
                body: messageParts.join('. '),
                data: {
                    url: '/app/presents/others'
                }
            });
        }
    }
] satisfies Cron;
