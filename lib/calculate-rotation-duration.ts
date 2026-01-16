/**
 * Calculate the duration of a rotation in years based on step dates
 * @param systemData - The system data containing steps with startDate and endDate
 * @returns Duration in years (minimum 1)
 */
export function getRotationDurationYears(systemData: any): number {
  if (!systemData?.steps || systemData.steps.length === 0) return 1;

  let startDate: Date | undefined;
  let endDate: Date | undefined;

  // Find the earliest start date and latest end date across all steps
  systemData.steps.forEach((step: any) => {
    if (step.startDate) {
      const stepStart = new Date(step.startDate);
      // Verify the date is valid
      if (!isNaN(stepStart.getTime())) {
        if (!startDate || stepStart < startDate) {
          startDate = stepStart;
        }
      }
    }
    if (step.endDate) {
      const stepEnd = new Date(step.endDate);
      // Verify the date is valid
      if (!isNaN(stepEnd.getTime())) {
        if (!endDate || stepEnd > endDate) {
          endDate = stepEnd;
        }
      }
    }
  });

  if (!startDate || !endDate) return 1;

  const durationMs = endDate.getTime() - startDate.getTime();
  const durationDays = durationMs / (1000 * 60 * 60 * 24);
  const durationYears = durationDays / 365.25;

  return Math.max(durationYears, 1);
}
