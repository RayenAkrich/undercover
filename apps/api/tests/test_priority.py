import unittest

from app.clustering.demo_data import synthetic_failure_events
from app.clustering.services.prioritization import score_cluster


class PriorityTest(unittest.TestCase):
    def test_priority_scores_on_100_point_scale_and_duplicate_refunds_are_p0(self):
        events = [
            event
            for event in synthetic_failure_events()
            if event["failure_type"] == "DUPLICATE_ACTION"
        ]

        score = score_cluster(events, max_count=len(events))

        self.assertGreaterEqual(score["priority_score"], 0)
        self.assertLessEqual(score["priority_score"], 100)
        self.assertEqual(score["priority_label"], "P0")


if __name__ == "__main__":
    unittest.main()
