namespace HealthTracker.API.Models;

/// <summary>
/// Represents the status of a medication dose
/// </summary>
public enum DoseStatus
{
    /// <summary>
    /// Dose is scheduled but not yet taken
    /// </summary>
    Pending = 0,

    /// <summary>
    /// Dose has been taken
    /// </summary>
    Taken = 1,

    /// <summary>
    /// Dose was intentionally skipped (with optional reason in Notes)
    /// </summary>
    Skipped = 2,

    /// <summary>
    /// Dose was not taken within the scheduled time window
    /// </summary>
    Missed = 3
}
