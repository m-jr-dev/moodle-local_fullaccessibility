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
 * Privacy provider tests.
 *
 * @package    local_fullaccessibility
 * @copyright  2026 Marcelo M. Almeida Júnior
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_fullaccessibility;

use core_privacy\local\request\writer;
use core_privacy\local\request\contextlist;
use core_privacy\tests\provider_testcase;
use local_fullaccessibility\privacy\provider;

/**
 * Privacy provider tests.
 *
 * @package    local_fullaccessibility
 * @coversDefaultClass \local_fullaccessibility\privacy\provider
 */
final class privacy_provider_test extends provider_testcase {

    /**
     * Ensure the system context is returned when the user preference exists.
     *
     * @covers ::get_contexts_for_userid
     */
    public function test_get_contexts_for_userid(): void {
        $this->resetAfterTest(true);

        $user = $this->getDataGenerator()->create_user();
        set_user_preference('local_fullaccessibility_state', '{"fontsize":110}', $user);

        $contextlist = provider::get_contexts_for_userid($user->id);
        $this->assertInstanceOf(contextlist::class, $contextlist);

        $contexts = $contextlist->get_contextids();
        $this->assertContains(\context_system::instance()->id, $contexts);
    }

    /**
     * Ensure the user preference is exported as user data in the system context.
     *
     * @covers ::export_user_data
     */
    public function test_export_user_preferences(): void {
        $this->resetAfterTest(true);

        $user = $this->getDataGenerator()->create_user();
        set_user_preference('local_fullaccessibility_state', '{"contrast":true}', $user);

        $context = \context_system::instance();
        $this->export_context_data_for_user($user->id, $context, 'local_fullaccessibility');

        $data = writer::with_context($context)->get_data([get_string('pluginname', 'local_fullaccessibility')]);
        $this->assertNotEmpty((array)$data);
    }
}
