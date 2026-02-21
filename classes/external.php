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
 * External functions for AJAX persistence.
 *
 * @package    local_fullaccessibility
 * @copyright  2026 Marcelo M. Almeida Júnior
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

global $CFG;

require_once($CFG->libdir . '/externallib.php');

/**
 * External API for local_fullaccessibility AJAX persistence.
 *
 * @package    local_fullaccessibility
 */
class local_fullaccessibility_external extends external_api {

    /**
     * Describes the parameters for a11y_state_save.
     *
     * @return external_function_parameters
     */
    public static function a11y_state_save_parameters(): external_function_parameters {
        return new external_function_parameters([
            'statejson' => new external_value(PARAM_RAW, 'Accessibility state JSON.'),
        ]);
    }

    /**
     * Saves the accessibility state for the current user.
     *
     * @param string $statejson Accessibility state JSON.
     * @return array Result data.
     */
    public static function a11y_state_save(string $statejson): array {
        $params = self::validate_parameters(self::a11y_state_save_parameters(), [
            'statejson' => $statejson,
        ]);

        require_login();
        require_sesskey();

        $context = context_system::instance();
        self::validate_context($context);
        require_capability('local/fullaccessibility:use', $context);

        set_user_preference('local_fullaccessibility_state', $params['statejson']);

        return ['status' => 'ok'];
    }

    /**
     * Describes the return structure for a11y_state_save.
     *
     * @return external_single_structure
     */
    public static function a11y_state_save_returns(): external_single_structure {
        return new external_single_structure([
            'status' => new external_value(PARAM_TEXT, 'ok'),
        ]);
    }

    /**
     * Describes the parameters for a11y_state_get.
     *
     * @return external_function_parameters
     */
    public static function a11y_state_get_parameters(): external_function_parameters {
        return new external_function_parameters([]);
    }

    /**
     * Gets the accessibility state for the current user.
     *
     * @return array Result data.
     */
    public static function a11y_state_get(): array {
        require_login();

        $context = context_system::instance();
        self::validate_context($context);
        require_capability('local/fullaccessibility:use', $context);

        $statejson = (string) get_user_preferences('local_fullaccessibility_state', '');

        return ['statejson' => $statejson];
    }

    /**
     * Describes the return structure for a11y_state_get.
     *
     * @return external_single_structure
     */
    public static function a11y_state_get_returns(): external_single_structure {
        return new external_single_structure([
            'statejson' => new external_value(PARAM_RAW, 'Accessibility state JSON.'),
        ]);
    }
}
