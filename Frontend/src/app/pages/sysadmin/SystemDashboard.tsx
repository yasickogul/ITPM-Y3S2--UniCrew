import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Building2, Users, MessageSquare, UserCog } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050';

type DashboardUniversity = {
  _id: string;
  name: string;
  domain: string;
  description?: string;
  createdAt?: string;
};

type ActivityDay = { date: string; count: number };

type DashboardPayload = {
  universityCount: number;
  studentCount: number;
  universityAdminCount: number;
  discussionCount: number;
  universities: DashboardUniversity[];
  activityLast7Days: ActivityDay[];
  maxActivity: number;
};

function weekdayLabel(isoDate: string) {
  const d = new Date(isoDate + 'T12:00:00');
  return d.toLocaleDateString(undefined, { weekday: 'short' });
}

export default function SystemDashboard() {
  const [stats, setStats] = useState<DashboardPayload | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('unicrew.auth.token');
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE_URL}/api/system-admin/dashboard-stats`, {
          headers: { Authorization: `Bearer ${token || ''}` },
        });
        const body = await res.json();
        if (!res.ok) {
          throw new Error(body.message || 'Failed to load dashboard');
        }
        if (!cancelled) {
          setStats(body.data);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const maxBar = stats?.maxActivity && stats.maxActivity > 0 ? stats.maxActivity : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Dashboard</h1>
        <p className="text-gray-600">Platform-wide statistics from the database</p>
      </div>

      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : null}

      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Universities</CardTitle>
            <Building2 className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '…' : stats?.universityCount ?? 0}</div>
            <p className="text-xs text-gray-600">In database</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <Users className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '…' : stats?.studentCount?.toLocaleString() ?? 0}</div>
            <p className="text-xs text-gray-600">Users with student role</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Discussions</CardTitle>
            <MessageSquare className="w-4 h-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '…' : stats?.discussionCount?.toLocaleString() ?? 0}</div>
            <p className="text-xs text-gray-600">Total discussion posts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">University admins</CardTitle>
            <UserCog className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '…' : stats?.universityAdminCount ?? 0}</div>
            <p className="text-xs text-gray-600">Admin accounts</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>University overview</CardTitle>
          <CardDescription>Recent universities (up to 20)</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-gray-500">Loading…</p>
          ) : !stats?.universities?.length ? (
            <p className="text-sm text-gray-500">No universities yet</p>
          ) : (
            <div className="space-y-4">
              {stats.universities.map((university) => (
                <div key={university._id} className="flex flex-col gap-2 border rounded-lg p-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{university.name}</p>
                    <p className="text-sm text-gray-600">@{university.domain}</p>
                    {university.description ? (
                      <p className="text-sm text-gray-500 line-clamp-2 mt-1">{university.description}</p>
                    ) : null}
                  </div>
                  <span className="inline-flex w-fit items-center rounded-full bg-green-100 px-3 py-1 text-sm text-green-800">
                    Active
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>New discussions (last 7 days)</CardTitle>
          <CardDescription>Daily counts from the database</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-gray-500">Loading…</p>
          ) : (
            <div className="h-64 flex items-end justify-between gap-2">
              {(stats?.activityLast7Days || []).map((day) => {
                const pct = Math.round((day.count / maxBar) * 100);
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-gradient-to-t from-blue-600 to-indigo-600 rounded-t min-h-[4px] transition-all"
                      style={{ height: `${Math.max(pct, day.count > 0 ? 8 : 4)}%` }}
                      title={`${day.date}: ${day.count}`}
                    />
                    <p className="text-xs text-gray-600 text-center">{weekdayLabel(day.date)}</p>
                    <p className="text-[10px] text-gray-400">{day.count}</p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
