"""Small TF-IDF embedding wrapper."""

from __future__ import annotations

from typing import Iterable

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer


def embed_texts(texts: Iterable[str]) -> np.ndarray:
    items = [text or "unknown failure" for text in texts]
    if not items:
        return np.empty((0, 0))
    return TfidfVectorizer(ngram_range=(1, 2), stop_words="english").fit_transform(items).toarray()
