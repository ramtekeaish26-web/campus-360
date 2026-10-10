import { describe, it, expect } from 'vitest';
import { AttendanceService } from '../src/services/attendanceService.js';

describe('Attendance Calculation Unit Tests', () => {
  it('should return 100% when there are no records', () => {
    const result = AttendanceService.calculatePercentage([]);
    expect(result.totalSessions).toBe(0);
    expect(result.percentage).toBe(100);
  });

  it('should calculate 100% for all PRESENT records', () => {
    const records = [{ status: 'PRESENT' }, { status: 'PRESENT' }, { status: 'PRESENT' }];
    const result = AttendanceService.calculatePercentage(records);
    expect(result.totalSessions).toBe(3);
    expect(result.presentSessions).toBe(3);
    expect(result.percentage).toBe(100);
  });

  it('should calculate 0% for all ABSENT records', () => {
    const records = [{ status: 'ABSENT' }, { status: 'ABSENT' }];
    const result = AttendanceService.calculatePercentage(records);
    expect(result.totalSessions).toBe(2);
    expect(result.presentSessions).toBe(0);
    expect(result.absentSessions).toBe(2);
    expect(result.percentage).toBe(0);
  });

  it('should treat LATE as 0.5 weight and EXCUSED as 1.0 weight', () => {
    // 4 sessions: 1 PRESENT (1.0) + 1 LATE (0.5) + 1 EXCUSED (1.0) + 1 ABSENT (0.0)
    // Effective = 2.5 / 4 = 62.5%
    const records = [
      { status: 'PRESENT' },
      { status: 'LATE' },
      { status: 'EXCUSED' },
      { status: 'ABSENT' },
    ];
    const result = AttendanceService.calculatePercentage(records);
    expect(result.totalSessions).toBe(4);
    expect(result.presentSessions).toBe(1);
    expect(result.lateSessions).toBe(1);
    expect(result.excusedSessions).toBe(1);
    expect(result.absentSessions).toBe(1);
    expect(result.percentage).toBe(62.5);
  });
});
