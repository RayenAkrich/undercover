import json
import unittest

from app.services.ingestion import import_sessions, parse_sessions


class FakeDatasetRepo:
    async def create(self, dataset):
        return dict({"id": "dataset-1"}, **dataset)


class FakeSessionRepo:
    def __init__(self):
        self.created = []

    async def create_with_events(self, dataset_id, session, events):
        self.created.append((dataset_id, session, events))
        return dict({"id": "session-1"}, **session)


class IngestionTests(unittest.IsolatedAsyncioTestCase):
    async def test_valid_file_imports_sessions(self):
        raw = {
            "session_id": "s-1",
            "messages": [{"role": "user", "content": "Refund $10"}],
            "tool_calls": [],
            "final_answer": "Done",
            "metadata": {"agent_version": "v3", "timestamp": "2026-09-27T10:00:00Z"},
        }
        session_repo = FakeSessionRepo()

        result = await import_sessions((json.dumps(raw) + "\n").encode(), "Demo", FakeDatasetRepo(), session_repo)

        self.assertEqual(result["accepted"], 1)
        self.assertEqual(result["rejected"], 0)
        self.assertEqual(session_repo.created[0][0], "dataset-1")
        self.assertEqual([event["event_type"] for event in session_repo.created[0][2]], ["USER_MESSAGE", "ASSISTANT_FINAL"])

    def test_malformed_jsonl_line_is_rejected_with_line_number(self):
        content = b'{"session_id":"s-1","messages":[{"role":"user","content":"hi"}]}\n{bad json}\n'

        parsed = parse_sessions(content)

        self.assertEqual(len(parsed.sessions), 1)
        self.assertEqual(parsed.rejected, 1)
        self.assertEqual(parsed.errors[0].line, 2)

    def test_bad_session_does_not_crash_whole_import(self):
        content = b'{"session_id":"ok","messages":[{"role":"user","content":"hi"}]}\n{"messages":[]}\n'

        parsed = parse_sessions(content)

        self.assertEqual([session["session_id"] for session in parsed.sessions], ["ok"])
        self.assertEqual(parsed.rejected, 1)
        self.assertIn("session_id", parsed.errors[0].message)


if __name__ == "__main__":
    unittest.main()
