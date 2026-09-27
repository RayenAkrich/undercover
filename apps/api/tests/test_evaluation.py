"""Person 4 slice tests: evaluation math + API smoke. US-E12-005 slice share."""

from app.services.evaluation import compare


def test_compare_perfect():
    m = compare({"a", "b"}, {"a", "b"})
    assert m == {
        "precision": 1.0,
        "recall": 1.0,
        "f1": 1.0,
        "false_positives": 0,
        "false_negatives": 0,
    }


def test_compare_partial():
    m = compare({"a", "b", "c"}, {"a", "b", "d"})
    assert m["false_positives"] == 1
    assert m["false_negatives"] == 1
    assert abs(m["precision"] - 2 / 3) < 1e-9
    assert abs(m["recall"] - 2 / 3) < 1e-9


def test_compare_empty_predictions():
    m = compare(set(), {"a"})
    assert m["precision"] == 0.0 and m["recall"] == 0.0 and m["f1"] == 0.0
