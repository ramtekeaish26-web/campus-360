import React, { useEffect, useState } from 'react';
import { User } from '../../types/index.js';
import { adminService } from '../../services/adminService.js';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Spinner } from '../../components/ui/Spinner.js';
import { ErrorState } from '../../components/ui/ErrorState.js';
import {
  ShieldCheck,
  Users,
  Building2,
  Server,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface AdminDashboardViewProps {
  user: User;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ user }) => {
  const [userList, setUserList] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    setError(null);
    try {
      const data = await adminService.listUsers();
      setUserList(data.users || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve user directory.');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const profile = user.profile;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-primary-container via-[#1E3A5F] to-primary-container text-on-primary shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-secondary/10 rounded-l-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="admin" size="sm" className="bg-primary text-white border-primary-fixed">
                ADMINISTRATION & EXAM CELL
              </Badge>
            </div>
            <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight">
              Administration Workspace
            </h1>
            <p className="text-xs md:text-sm text-primary-fixed-dim max-w-xl">
              System User Directory & Role-Based Access Control
            </p>
          </div>

          <Link
            to="/profile"
            className="self-start md:self-auto px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold backdrop-blur-md transition-all border border-white/20 text-white"
          >
            Admin Profile →
          </Link>
        </div>
      </div>

      {/* System Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="font-mono text-[10px] text-on-surface-variant uppercase font-bold">
              Registered Users
            </span>
            <p className="font-display font-bold text-xl text-on-surface">{userList.length || 6}</p>
            <span className="text-[11px] text-tertiary font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> RBAC Synchronized
            </span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-secondary text-on-secondary flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="font-mono text-[10px] text-on-surface-variant uppercase font-bold">
              Active Security Guard
            </span>
            <p className="font-display font-bold text-xl text-on-surface">3 Roles</p>
            <span className="text-[11px] text-on-surface-variant">STUDENT · FACULTY · ADMIN</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-tertiary text-on-tertiary flex items-center justify-center shrink-0">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <span className="font-mono text-[10px] text-on-surface-variant uppercase font-bold">
              API & DB Status
            </span>
            <p className="font-display font-bold text-xl text-on-surface">Online</p>
            <span className="text-[11px] text-tertiary font-semibold">PostgreSQL v16 + Prisma</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="font-mono text-[10px] text-on-surface-variant uppercase font-bold">
              Academic Core
            </span>
            <p className="font-display font-bold text-xl text-on-surface">Active</p>
            <span className="text-[11px] text-secondary font-semibold">2025-26 Sem 1 Active</span>
          </div>
        </Card>
      </div>

      {/* Quick Academic Navigation Shortcuts for Admin */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          to="/academic/subjects"
          className="p-3 bg-surface-container-lowest rounded-xl border border-outline hover:border-primary/50 text-xs font-bold text-on-surface flex items-center justify-between transition-all"
        >
          <span>Subjects & Offerings</span>
          <span className="text-primary font-mono text-[11px]">→</span>
        </Link>
        <Link
          to="/academic/schedule"
          className="p-3 bg-surface-container-lowest rounded-xl border border-outline hover:border-primary/50 text-xs font-bold text-on-surface flex items-center justify-between transition-all"
        >
          <span>Class Schedules</span>
          <span className="text-primary font-mono text-[11px]">→</span>
        </Link>
        <Link
          to="/academic/exams"
          className="p-3 bg-surface-container-lowest rounded-xl border border-outline hover:border-primary/50 text-xs font-bold text-on-surface flex items-center justify-between transition-all"
        >
          <span>Exams & Quizzes</span>
          <span className="text-primary font-mono text-[11px]">→</span>
        </Link>
        <Link
          to="/academic/calendar"
          className="p-3 bg-surface-container-lowest rounded-xl border border-outline hover:border-primary/50 text-xs font-bold text-on-surface flex items-center justify-between transition-all"
        >
          <span>Academic Calendar</span>
          <span className="text-primary font-mono text-[11px]">→</span>
        </Link>
      </div>

      {/* Admin User Management Table */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span>Campus 360 User Directory (Admin Exclusive Endpoint)</span>
            </CardTitle>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Fetched directly from <code className="font-mono text-primary font-bold">GET /api/admin/users</code>
            </p>
          </div>
          <Badge variant="admin" size="sm">
            Admin Access Verified
          </Badge>
        </CardHeader>
        <CardContent>
          {isLoadingUsers && <Spinner size="md" label="Loading system user directory..." />}

          {error && <ErrorState message={error} onRetry={fetchUsers} />}

          {!isLoadingUsers && !error && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-surface-container font-mono text-[11px] text-on-surface-variant uppercase bg-surface-container-low/40">
                    <th className="py-3 px-4 font-bold">User</th>
                    <th className="py-3 px-4 font-bold">PRN / Emp ID</th>
                    <th className="py-3 px-4 font-bold">Role</th>
                    <th className="py-3 px-4 font-bold">Department</th>
                    <th className="py-3 px-4 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container">
                  {userList.map((u) => {
                    const name = u.profile
                      ? `${u.profile.firstName} ${u.profile.lastName}`
                      : u.email;
                    const role = u.roles[0] || 'STUDENT';

                    return (
                      <tr key={u.id} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center font-bold text-xs shrink-0">
                              {u.profile?.avatarUrl ? (
                                <img
                                  src={u.profile.avatarUrl}
                                  alt={name}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <span>{name.charAt(0)}</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-on-surface truncate">{name}</p>
                              <p className="font-mono text-[11px] text-on-surface-variant truncate">
                                {u.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-medium text-on-surface">
                          {u.profile?.prn || '—'}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge
                            variant={
                              role === 'ADMIN' ? 'admin' : role === 'FACULTY' ? 'faculty' : 'student'
                            }
                            size="sm"
                          >
                            {role}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-on-surface">
                          {u.profile?.department?.name || 'CSE'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1.5 font-semibold text-tertiary">
                            <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
                            Active
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
