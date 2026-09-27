"""Ensure `apps/api` is on sys.path so `import app...` resolves under pytest."""

import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
