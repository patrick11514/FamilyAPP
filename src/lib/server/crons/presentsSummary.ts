import { sendNotification, type Cron } from '../functions';
import { conn } from '../variables';

/**
 * Present states
 */
enum PresentState {
    AVAILABLE = 0,
    RESERVED = 1,
    GIVEN = 2
}

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

        // Get all new presents added in the past week (excluding already given ones)
        const allNewPresents = await conn
            .selectFrom('present')
            .innerJoin('user', 'user.id', 'present.user_id')
            .select([
                'present.id',
                'present.name',
                'present.user_id',
                'user.firstname as owner_firstname'
            ])
            .where('present.created_at', '>=', oneWeekAgo)
            .where('present.state', '!=', PresentState.GIVEN)
            .execute();

        // Get all presents reserved in the past week
        const allReservedPresents = await conn
            .selectFrom('present')
            .innerJoin('user', 'user.id', 'present.reserved_id')
            .select([
                'present.id',
                'present.name',
                'present.user_id',
                'user.firstname as reserver_firstname'
            ])
            .where('present.reserved_at', '>=', oneWeekAgo)
            .where('present.state', '>=', PresentState.RESERVED)
            .execute();

        for (const user of users) {
            // Filter new presents for this user (presents by others)
            const newPresents = allNewPresents.filter((p) => p.user_id !== user.id);

            // Filter reserved presents for this user (their own presents)
            const reservedPresents = allReservedPresents.filter(
                (p) => p.user_id === user.id
            );

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
