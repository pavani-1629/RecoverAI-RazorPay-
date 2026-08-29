from pathlib import Path

import joblib


# backend/models/recovery_model.joblib
MODEL_PATH = (
    Path(__file__).resolve().parents[2]
    / "models"
    / "recovery_model.joblib"
)


class RecoveryModel:
    def __init__(self):
        if not MODEL_PATH.exists():
            raise FileNotFoundError(
                f"Recovery model not found at: {MODEL_PATH}"
            )

        self.model = joblib.load(MODEL_PATH)

    def predict_probability(self, features):
        """
        Return probability that a failed transaction
        is recoverable.
        """

        probability = self.model.predict_proba(features)[0][1]

        return float(probability)


# Load the model once when the application starts.
recovery_model = RecoveryModel()