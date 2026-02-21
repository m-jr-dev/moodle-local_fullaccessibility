@local @local_fullaccessibility
Feature: Full Accessibility menu
  In order to access accessibility controls
  As a user
  I need to see the accessibility menu in the navigation

  Scenario: Accessibility menu is available on the front page
    Given I log in as "admin"
    And the following config values are set as admin:
      | local_fullaccessibility/enableplugin | 1 |
    When I am on site homepage
    Then "#nav-accessibility-popover-container" "css_element" should exist
