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
 * Library callbacks.
 *
 * @package    local_fullaccessibility
 * @copyright  2026 Marcelo M. Almeida Júnior
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * Initialises the plugin assets on the page.
 *
 * @param moodle_page $page
 */
function local_fullaccessibility_page_init(moodle_page $page): void {
    global $USER;

    /* Plugin global enable check */
    if (!get_config('local_fullaccessibility', 'enableplugin')) {
        return;
    }

    /* Avoid execution in CLI */
    if (defined('CLI_SCRIPT') && CLI_SCRIPT) {
        return;
    }

    /* Capability validation */
    $systemcontext = context_system::instance();
    if (!has_capability('local/fullaccessibility:use', $systemcontext, $USER)) {
        return;
    }

    /* Logged user state */
    $isloggedin = (isloggedin() && !isguestuser());

    /* Feature flags */
    $config = [
        'enabletext'        => (bool) get_config('local_fullaccessibility', 'enable_text'),
        'enableimage'       => (bool) get_config('local_fullaccessibility', 'enable_image'),
        'enablereading'     => (bool) get_config('local_fullaccessibility', 'enable_reading'),
        'enablenavigation'  => (bool) get_config('local_fullaccessibility', 'enable_navigation'),
        'enableaudio'       => (bool) get_config('local_fullaccessibility', 'enable_audio'),
        'enabletts'         => (bool) get_config('local_fullaccessibility', 'enable_tts'),
        'enablestt'         => (bool) get_config('local_fullaccessibility', 'enable_stt'),
        'loggedin'          => $isloggedin,
    ];

    /* Load assets */
    $page->requires->css(new moodle_url('/local/fullaccessibility/styles.css'));
    $page->requires->js_call_amd(
        'local_fullaccessibility/fullaccessibility',
        'init',
        [$config]
    );
}

/**
 * Injects the accessibility tools on pages (navigation callback).
 *
 * @param global_navigation $navigation
 */
function local_fullaccessibility_extend_navigation(global_navigation $navigation): void {
    global $PAGE;

    /* Initialise plugin assets */
    local_fullaccessibility_page_init($PAGE);
}
