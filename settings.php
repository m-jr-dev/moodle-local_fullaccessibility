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
 * Plugin settings.
 *
 * @package    local_fullaccessibility
 * @copyright  2026 Marcelo M. Almeida Júnior
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

if ($hassiteconfig) {
    $settings = new admin_settingpage('local_fullaccessibility', get_string('pluginname', 'local_fullaccessibility'));

    $settings->add(new admin_setting_configcheckbox(
        'local_fullaccessibility/enableplugin',
        get_string('enableplugin', 'local_fullaccessibility'),
        get_string('enableplugin_desc', 'local_fullaccessibility'),
        1
    ));

    $settings->add(new admin_setting_heading(
        'local_fullaccessibility/heading_features',
        get_string('settings', 'local_fullaccessibility'),
        ''
    ));

    $settings->add(new admin_setting_configcheckbox(
        'local_fullaccessibility/enable_text',
        get_string('enable_text', 'local_fullaccessibility'),
        get_string('enable_text_desc', 'local_fullaccessibility'),
        1
    ));

    $settings->add(new admin_setting_configcheckbox(
        'local_fullaccessibility/enable_image',
        get_string('enable_image', 'local_fullaccessibility'),
        get_string('enable_image_desc', 'local_fullaccessibility'),
        1
    ));

    $settings->add(new admin_setting_configcheckbox(
        'local_fullaccessibility/enable_reading',
        get_string('enable_reading', 'local_fullaccessibility'),
        get_string('enable_reading_desc', 'local_fullaccessibility'),
        1
    ));

    $settings->add(new admin_setting_configcheckbox(
        'local_fullaccessibility/enable_navigation',
        get_string('enable_navigation', 'local_fullaccessibility'),
        get_string('enable_navigation_desc', 'local_fullaccessibility'),
        1
    ));

    $settings->add(new admin_setting_configcheckbox(
        'local_fullaccessibility/enable_audio',
        get_string('enable_audio', 'local_fullaccessibility'),
        get_string('enable_audio_desc', 'local_fullaccessibility'),
        0
    ));

    $settings->add(new admin_setting_configcheckbox(
        'local_fullaccessibility/enable_tts',
        get_string('enable_tts', 'local_fullaccessibility'),
        get_string('enable_tts_desc', 'local_fullaccessibility'),
        1
    ));

    $settings->add(new admin_setting_configcheckbox(
        'local_fullaccessibility/enable_stt',
        get_string('enable_stt', 'local_fullaccessibility'),
        get_string('enable_stt_desc', 'local_fullaccessibility'),
        0
    ));

    $ADMIN->add('localplugins', $settings);
}
