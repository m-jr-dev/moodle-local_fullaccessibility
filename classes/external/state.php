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
 * External API for persisting user state.
 *
 * @package    local_fullaccessibility
 * @copyright  2026 Marcelo M. Almeida Júnior
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_fullaccessibility\external;

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_single_structure;
use core_external\external_value;

/**
 * External service endpoints for accessibility state persistence.
 *
 * @package    local_fullaccessibility
 */
class state extends external_api {

    /** Preference key. */
    private const USERPREF_KEY = 'local_fullaccessibility_state';

    /**
     * Returns parameters for get_state().
     *
     * @return external_function_parameters
     */
    public static function get_state_parameters(): external_function_parameters {
        return new external_function_parameters([]);
    }

    /**
     * Get saved state for the current user.
     *
     * @return array
     */
    public static function get_state(): array {
        self::validate_parameters(self::get_state_parameters(), []);
        require_login();

        $context = \context_system::instance();
        self::validate_context($context);
        require_capability('local/fullaccessibility:use', $context);

        $statejson = (string)get_user_preferences(self::USERPREF_KEY, '');

        return [
            'statejson' => $statejson,
        ];
    }

    /**
     * Returns description of get_state() result value.
     *
     * @return external_single_structure
     */
    public static function get_state_returns(): external_single_structure {
        return new external_single_structure([
            'statejson' => new external_value(PARAM_RAW, 'State JSON (may be empty).'),
        ]);
    }

    /**
     * Returns parameters for save_state().
     *
     * @return external_function_parameters
     */
    public static function save_state_parameters(): external_function_parameters {
        return new external_function_parameters([
            'statejson' => new external_value(PARAM_RAW, 'State JSON.'),
        ]);
    }

    /**
     * Save state for the current user.
     *
     * @param string $statejson
     * @return array
     */
    public static function save_state(string $statejson): array {
        $params = self::validate_parameters(self::save_state_parameters(), [
            'statejson' => $statejson,
        ]);

        require_login();

        $context = \context_system::instance();
        self::validate_context($context);
        require_capability('local/fullaccessibility:use', $context);

        set_user_preference(self::USERPREF_KEY, (string)$params['statejson']);

        return ['status' => true];
    }

    /**
     * Returns description of save_state() result value.
     *
     * @return external_single_structure
     */
    public static function save_state_returns(): external_single_structure {
        return new external_single_structure([
            'status' => new external_value(PARAM_BOOL, 'True on success.'),
        ]);
    }
}
