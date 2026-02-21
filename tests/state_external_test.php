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
 * Tests for external state persistence.
 *
 * @package    local_fullaccessibility
 * @copyright  2026 Marcelo M. Almeida Júnior
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_fullaccessibility;

use local_fullaccessibility\external\state;
use core_external\external_api;

/**
 * Tests for the external API state persistence.
 *
 * @package    local_fullaccessibility
 * @coversDefaultClass \local_fullaccessibility\external\state
 */
final class state_external_test extends \advanced_testcase {

    /**
     * Ensure state can be saved and retrieved for the same user.
     *
     * @covers ::save_state
     * @covers ::get_state
     */
    public function test_save_and_get_state(): void {
        $this->resetAfterTest(true);

        $user = $this->getDataGenerator()->create_user();
        $this->setUser($user);

        $payload = ['contrast' => true, 'fontsize' => 110];
        $result = state::save_state(json_encode($payload));
        $result = external_api::clean_returnvalue(state::save_state_returns(), $result);

        $this->assertTrue($result['status']);

        $result = state::get_state();
        $result = external_api::clean_returnvalue(state::get_state_returns(), $result);

        $this->assertSame(json_encode($payload), $result['statejson']);
    }
}
