import { TSchedule } from './offeredCourse.interface';

export const hasTimeConflict = (
  existingSchedules: TSchedule[],
  requestedSchedule: TSchedule,
) => {
  for (const schedule of existingSchedules) {
    const existingStartTime = new Date(`1970-01-01T${schedule.startTime}`);
    const existingEndTime = new Date(`1970-01-01T${schedule.endTime}`);
    const requestedStartTime = new Date(
      `1970-01-01T${requestedSchedule.startTime}`,
    );
    const requestedEndTime = new Date(
      `1970-01-01T${requestedSchedule.endTime}`,
    );

    //Let's Consider:
    // existingTime: 11.30 - 12.30 ---- requestedTime: 11.00 - 12.00 [Conflict]
    // existingTime: 09.30 - 10.30 ---- requestedTime: 11.00 - 12.00 [No Conflict]

    if (
      requestedStartTime < existingEndTime &&
      requestedEndTime > existingStartTime
    )
      return true;
  }

  return false;
};
