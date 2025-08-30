<script lang="ts">
    import { Button, Input, TextArea } from '$/components/form';
    import Icon from '$/components/Icon.svelte';
    import { API } from '$/lib/api';
    import { SwalAlert } from '$/lib/functions';
    import type { User } from '$/types/database';
    import type { Selectable } from 'kysely';

    let users = $state<
        (Omit<Selectable<User>, 'password'> & { group_id: number | null })[]
    >([]);
    let selectedUserId = $state<number>(0);
    let title = $state<string>('Test Notification');
    let body = $state<string>('This is a test notification from the admin panel.');
    let priority = $state<'high' | 'normal' | 'low'>('normal');
    let tag = $state<string>('test-notification');
    let loading = $state<boolean>(false);

    // Load users
    const loadUsers = async () => {
        const response = await API.users.GET();
        if (response.status) {
            users = response.data as typeof users;
        } else {
            SwalAlert({
                icon: 'error',
                title: 'Failed to load users'
            });
        }
    };

    loadUsers();

    const sendTestNotification = async () => {
        if (!selectedUserId || !title.trim() || !body.trim()) {
            SwalAlert({
                icon: 'warning',
                title: 'Please fill in all required fields'
            });
            return;
        }

        loading = true;
        try {
            const response = await API.notifications.POST({
                userId: selectedUserId,
                title: title.trim(),
                body: body.trim(),
                priority,
                tag: tag.trim() || undefined
            });

            if (response.status) {
                SwalAlert({
                    icon: 'success',
                    title: 'Test notification sent successfully!',
                    text: 'The notification has been sent to the selected user.'
                });
                // Reset form
                title = 'Test Notification';
                body = 'This is a test notification from the admin panel.';
                priority = 'normal';
                tag = 'test-notification';
            } else {
                SwalAlert({
                    icon: 'error',
                    title: 'Failed to send notification',
                    text: response.message
                });
            }
        } catch {
            SwalAlert({
                icon: 'error',
                title: 'Failed to send notification',
                text: 'An unexpected error occurred'
            });
        } finally {
            loading = false;
        }
    };
</script>

<svelte:head>
    <title>Notification Tester - FamilyAPP</title>
</svelte:head>

<div class="p-6">
    <div class="mb-6">
        <h1 class="mb-2 text-3xl font-bold text-gray-900">Notification Tester</h1>
        <p class="text-gray-600">
            Send test notifications to users for debugging and testing purposes.
        </p>
    </div>

    <div class="max-w-2xl rounded-lg bg-white p-6 shadow-md">
        <form onsubmit={sendTestNotification} class="space-y-6">
            <div>
                <label
                    for="user-select"
                    class="mb-2 block text-sm font-medium text-gray-700"
                >
                    Select User *
                </label>
                <select
                    id="user-select"
                    bind:value={selectedUserId}
                    class="bg-secondary text-text placeholder:text-text invalid:border-accent focus:border-primary w-full rounded-md border-2 border-white px-4 py-1 text-2xl font-bold outline-hidden transition-colors duration-200 lg:text-3xl"
                    required
                >
                    <option value={0} disabled
                        >Choose a user to send notification to...</option
                    >
                    {#each users as user (user.id)}
                        <option value={user.id}>
                            {user.firstname}
                            {user.lastname} ({user.username})
                        </option>
                    {/each}
                </select>
            </div>

            <div>
                <label
                    for="notification-title"
                    class="mb-2 block text-sm font-medium text-gray-700"
                >
                    Notification Title *
                </label>
                <Input
                    id="notification-title"
                    bind:value={title}
                    placeholder="Enter notification title"
                    required
                />
            </div>

            <div>
                <label
                    for="notification-body"
                    class="mb-2 block text-sm font-medium text-gray-700"
                >
                    Notification Body *
                </label>
                <TextArea
                    id="notification-body"
                    bind:value={body}
                    placeholder="Enter notification message"
                    rows={4}
                    required
                />
            </div>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <label
                        for="notification-priority"
                        class="mb-2 block text-sm font-medium text-gray-700"
                    >
                        Priority
                    </label>
                    <select
                        id="notification-priority"
                        bind:value={priority}
                        class="bg-secondary text-text placeholder:text-text invalid:border-accent focus:border-primary w-full rounded-md border-2 border-white px-4 py-1 text-2xl font-bold outline-hidden transition-colors duration-200 lg:text-3xl"
                    >
                        <option value="low">Low</option>
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                    </select>
                </div>

                <div>
                    <label
                        for="notification-tag"
                        class="mb-2 block text-sm font-medium text-gray-700"
                    >
                        Tag (Optional)
                    </label>
                    <Input
                        id="notification-tag"
                        bind:value={tag}
                        placeholder="Notification tag"
                    />
                </div>
            </div>

            <div class="flex items-center justify-between pt-4">
                <div class="text-sm text-gray-500">* Required fields</div>
                <Button
                    type="submit"
                    disabled={loading || !selectedUserId || !title.trim() || !body.trim()}
                    class="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
                >
                    {#if loading}
                        <Icon name="bi-arrow-repeat" class="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                    {:else}
                        <Icon name="bi-send" class="mr-2 h-4 w-4" />
                        Send Test Notification
                    {/if}
                </Button>
            </div>
        </form>
    </div>

    <div class="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <div class="flex items-start">
            <Icon
                name="bi-exclamation-triangle"
                class="mt-0.5 mr-3 h-5 w-5 text-yellow-600"
            />
            <div>
                <h3 class="mb-1 text-sm font-medium text-yellow-800">Important Notes</h3>
                <ul class="space-y-1 text-sm text-yellow-700">
                    <li>
                        • Test notifications will be sent to the selected user's
                        registered devices
                    </li>
                    <li>
                        • Make sure the user has push notifications enabled in their
                        browser
                    </li>
                    <li>
                        • This feature is only available to users with admin.notifications
                        permission
                    </li>
                </ul>
            </div>
        </div>
    </div>
</div>
