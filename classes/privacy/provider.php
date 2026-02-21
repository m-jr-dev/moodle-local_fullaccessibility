<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Privacy Subsystem implementation for local_fullaccessibility.
 *
 * @package    local_fullaccessibility
 * @copyright  2026 Marcelo M. Almeida Júnior
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_fullaccessibility\privacy;

use core_privacy\local\metadata\collection;
use core_privacy\local\request\contextlist;
use core_privacy\local\request\approved_contextlist;
use core_privacy\local\request\approved_userlist;
use core_privacy\local\request\userlist;
use core_privacy\local\request\writer;

/**
 * Privacy provider implementation for local_fullaccessibility.
 *
 * @package    local_fullaccessibility
 */
class provider implements
    \core_privacy\local\metadata\provider,
    \core_privacy\local\request\plugin\provider,
    \core_privacy\local\request\core_userlist_provider {

    /** Preference key. */
    private const USERPREF_KEY = 'local_fullaccessibility_state';

    /**
     * Returns the metadata about this plugin.
     *
     * @param collection $collection The initialised collection to add items to.
     * @return collection The updated collection of metadata items.
     */
    public static function get_metadata(collection $collection): collection {
        $collection->add_user_preference(self::USERPREF_KEY, 'privacy:metadata:userpref_state');
        return $collection;
    }

    /**
     * Get the list of contexts that contain user information for the specified user.
     *
     * @param int $userid The user to search.
     * @return contextlist The contextlist containing the list of contexts used in this plugin.
     */
    public static function get_contexts_for_userid(int $userid): contextlist {
        $contextlist = new contextlist();
        $state = get_user_preferences(self::USERPREF_KEY, null, $userid);
        if ($state !== null) {
            $contextlist->add_system_context();
        }
        return $contextlist;
    }

    /**
     * Export personal data for the specified user.
     *
     * @param approved_contextlist $contextlist The approved contexts to export information for.
     */
    public static function export_user_data(approved_contextlist $contextlist): void {
        $userid = $contextlist->get_user()->id;

        if (!in_array(\context_system::instance()->id, $contextlist->get_contextids(), true)) {
            return;
        }

        $state = (string)get_user_preferences(self::USERPREF_KEY, '', $userid);

        writer::with_context(\context_system::instance())->export_data(
            [get_string('pluginname', 'local_fullaccessibility')],
            (object)['statejson' => $state]
        );
    }

    /**
     * Delete all user data for the specified user.
     *
     * @param approved_contextlist $contextlist The approved contexts to delete information for.
     */
    public static function delete_data_for_all_users_in_context(\context $context): void {
        if (!$context instanceof \context_system) {
            return;
        }
        // User preferences are per-user and will be removed through user deletion flows.
    }

    /**
     * Delete personal data for the specified user.
     *
     * @param approved_contextlist $contextlist The approved contexts to delete information for.
     */
    public static function delete_data_for_user(approved_contextlist $contextlist): void {
        $userid = $contextlist->get_user()->id;

        if (!in_array(\context_system::instance()->id, $contextlist->get_contextids(), true)) {
            return;
        }

        unset_user_preference(self::USERPREF_KEY, $userid);
    }

    /**
     * Get users in context.
     *
     * @param userlist $userlist The userlist to add users to.
     */
    public static function get_users_in_context(userlist $userlist): void {
        // No context-specific storage.
    }

    /**
     * Delete data for users in approved userlist.
     *
     * @param approved_userlist $userlist The approved userlist.
     */
    public static function delete_data_for_users(approved_userlist $userlist): void {
        // No context-specific storage.
    }
}
