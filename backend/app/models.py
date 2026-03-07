import os
from enum import Enum
from typing import Dict, Literal

from pydantic import BaseModel, Field

LANES = ("North", "South", "East", "West")


class LightColor(str, Enum):
    RED = "RED"
    YELLOW = "YELLOW"
    GREEN = "GREEN"


class TelemetryEvent(BaseModel):
    lane: Literal["North", "South", "East", "West"]
    count: int = Field(ge=0, le=50)
    density: float = Field(ge=0.0, le=100.0)
    ambulance: bool = False
    ts: int


class EmergencyRequest(BaseModel):
    lane: Literal["North", "South", "East", "West"] = "North"
    duration_seconds: int = Field(default=30, ge=10, le=120)


class SignalUpdate(BaseModel):
    type: Literal["SIGNAL_UPDATE", "EMERGENCY_OVERRIDE", "DENSITY_UPDATE"]
    intersection: str = Field(default_factory=lambda: os.getenv("INTERSECTION_ID", "INT-001"))
    lights: Dict[str, LightColor]
    densities: Dict[str, float]
    counts: Dict[str, int] = {}
    active_emergency: bool
    ts: int
    cycle_count: int
    avg_wait_seconds: float
    last_event: str
