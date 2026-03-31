from pathlib import Path

HTML_FILE = Path(__file__).resolve().parent.parent / "src" / "static" / "index.html"
JS_FILE = Path(__file__).resolve().parent.parent / "src" / "static" / "app.js"


def test_index_html_has_required_ui_sections():
    # Arrange
    html = HTML_FILE.read_text(encoding="utf-8")

    # Act / Assert
    assert '<div id="activities-list">' in html
    assert '<form id="signup-form"' in html
    assert '<select id="activity"' in html
    assert '<button type="submit">Sign Up</button>' in html
    assert '<script src="app.js"></script>' in html


def test_app_js_includes_participant_remove_and_pagination():
    # Arrange
    js = JS_FILE.read_text(encoding="utf-8")

    # Act / Assert
    assert ".participant-remove" in js
    assert "participants-list" in js
    assert "pagination-controls" in js
    assert "fetch(\"/activities\")" in js
    assert "event.target.closest(\".participant-remove\")" in js
