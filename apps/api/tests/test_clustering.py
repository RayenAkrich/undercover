import unittest

from app.clustering.cluster import cluster_failure_events
from app.clustering.demo_data import synthetic_failure_events


class ClusteringTest(unittest.TestCase):
    def test_synthetic_groups_cluster_and_noise_is_preserved(self):
        result = cluster_failure_events(synthetic_failure_events())

        self.assertGreaterEqual(len(result["clusters"]), 4)
        self.assertTrue(result["noise"])
        self.assertTrue(
            all(cluster["occurrence_count"] >= 5 for cluster in result["clusters"])
        )


if __name__ == "__main__":
    unittest.main()
