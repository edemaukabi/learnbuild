'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ConfirmModal from '@/components/ui/ConfirmModal';
import api from '@/lib/api';

type UserRole = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isEmailVerified: boolean;
  createdAt: string;
  _count: { enrollments: number; courses: number };
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const ROLE_COLORS: Record<UserRole, string> = {
  STUDENT: 'bg-[var(--sky-soft)] text-[var(--sky)]',
  INSTRUCTOR: 'bg-[var(--teal-soft)] text-[var(--teal)]',
  ADMIN: 'bg-[var(--violet)]/10 text-[var(--violet)]',
};

const ROLES: UserRole[] = ['STUDENT', 'INSTRUCTOR', 'ADMIN'];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminUser | null>(null);

  const fetchUsers = useCallback(async (p: number, q: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: '20' });
      if (q) params.set('search', q);
      const res = await api.get<{ data: AdminUser[]; meta: Meta }>(`/admin/users?${params}`);
      setUsers(res.data.data);
      setMeta(res.data.meta);
    } catch {
      //
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(1, ''); }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers(1, search);
  };

  const handleRoleChange = async (userId: string, role: UserRole) => {
    setUpdatingId(userId);
    try {
      const res = await api.patch<AdminUser>(`/admin/users/${userId}/role`, { role });
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: res.data.role } : u));
    } catch {
      //
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!pendingDelete) return;
    await api.delete(`/admin/users/${pendingDelete.id}`);
    setUsers((prev) => prev.filter((u) => u.id !== pendingDelete.id));
    if (meta) setMeta({ ...meta, total: meta.total - 1 });
    setPendingDelete(null);
  };

  const colSpan = 7;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--fg)]">Users</h1>
          {meta && <p className="text-sm text-[var(--fg-4)] mt-0.5">{meta.total.toLocaleString()} total</p>}
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fg-4)]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or email…"
              className="pl-8 w-56 h-8 text-sm"
            />
          </div>
          <Button type="submit" className="h-8 text-sm px-3">Search</Button>
        </form>
      </div>

      <div className="rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--card)]">
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--fg-4)]">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--fg-4)]">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--fg-4)]">Enrolled</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--fg-4)]">Courses</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--fg-4)]">Joined</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--fg-4)]">Change role</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr><td colSpan={colSpan} className="px-4 py-8 text-center text-[var(--fg-4)]">Loading…</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={colSpan} className="px-4 py-8 text-center text-[var(--fg-4)]">No users found</td></tr>
              ) : users.map((u) => (
                <tr key={u.id} className="bg-[var(--surface)] hover:bg-[var(--card)] transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[var(--fg)]">{u.firstName} {u.lastName}</p>
                    <p className="text-xs text-[var(--fg-4)]">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ROLE_COLORS[u.role]}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--fg-3)]">{u._count.enrollments}</td>
                  <td className="px-4 py-3 text-[var(--fg-3)]">{u._count.courses}</td>
                  <td className="px-4 py-3 text-[var(--fg-4)] text-xs">
                    {new Date(u.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                      disabled={updatingId === u.id}
                      className="h-7 rounded border border-[var(--border-2)] bg-[var(--card)] px-2 text-xs text-[var(--fg)] focus:border-[var(--sky)] focus:outline-none disabled:opacity-50"
                    >
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setPendingDelete(u)}
                      className="p-1.5 rounded-md text-[var(--fg-4)] hover:text-[var(--rose)] hover:bg-[var(--rose)]/10 transition-colors"
                      title="Delete user"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center gap-2 justify-end">
          <Button
            variant="outline"
            className="h-8 text-sm px-3"
            disabled={page === 1}
            onClick={() => { const p = page - 1; setPage(p); fetchUsers(p, search); }}
          >
            Previous
          </Button>
          <span className="text-xs text-[var(--fg-4)]">Page {page} of {meta.totalPages}</span>
          <Button
            variant="outline"
            className="h-8 text-sm px-3"
            disabled={page === meta.totalPages}
            onClick={() => { const p = page + 1; setPage(p); fetchUsers(p, search); }}
          >
            Next
          </Button>
        </div>
      )}

      <ConfirmModal
        open={pendingDelete !== null}
        title="Delete user"
        description={pendingDelete ? `Are you sure you want to delete ${pendingDelete.firstName} ${pendingDelete.lastName}?` : ''}
        details={pendingDelete ? `This will permanently remove their account along with ${pendingDelete._count.enrollments} enrollment${pendingDelete._count.enrollments !== 1 ? 's' : ''} and ${pendingDelete._count.courses} course${pendingDelete._count.courses !== 1 ? 's' : ''}. This action cannot be undone.` : ''}
        confirmLabel="Delete user"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
