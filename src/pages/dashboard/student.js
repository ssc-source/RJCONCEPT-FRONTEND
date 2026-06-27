import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { buildTestAttemptPath, buildTestResultPath, buildTestSeriesTestsPath } from '../../utils/testRoutes';
import Layout from '../../components/Layout';
import api from '../../services/api';
import { formatCurrency } from '../../utils/format';
import { usePublicAuthStore } from '../../stores/publicAuthStore';

export default function StudentDashboard() {
  const router = useRouter();
  const { logout } = usePublicAuthStore();
  const [state, setState] = useState({
    user: null,
    notifications: [],
    addresses: [],
    orders: [],
    refunds: [],
    enrollments: [],
    testAttempts: [],
    loading: true,
  });

  useEffect(() => {
    Promise.allSettled([
      api.get('/auth/me', { meta: { scope: 'public' } }),
      api.get('/notifications', { meta: { scope: 'public' } }),
      api.get('/addresses', { meta: { scope: 'public' } }),
      api.get('/orders/my', { meta: { scope: 'public' } }),
      api.get('/orders/my/refunds', { meta: { scope: 'public' } }),
      api.get('/test-enrollments/my', { meta: { scope: 'public' } }),
      api.get('/test-attempts/history', { meta: { scope: 'public' } }),
    ]).then(([meRes, notificationsRes, addressesRes, ordersRes, refundsRes, enrollmentsRes, attemptsRes]) => {
      setState({
        user: meRes.status === 'fulfilled' ? meRes.value.user || null : null,
        notifications: notificationsRes.status === 'fulfilled' ? notificationsRes.value.data || [] : [],
        addresses: addressesRes.status === 'fulfilled' ? addressesRes.value.data || [] : [],
        orders: ordersRes.status === 'fulfilled' ? ordersRes.value.data || [] : [],
        refunds: refundsRes.status === 'fulfilled' ? refundsRes.value.data || [] : [],
        enrollments: enrollmentsRes.status === 'fulfilled' ? enrollmentsRes.value.data || [] : [],
        testAttempts: attemptsRes.status === 'fulfilled' ? attemptsRes.value.data || [] : [],
        loading: false,
      });
    });
  }, []);

  const unreadNotifications = useMemo(
    () => state.notifications.filter((item) => !item.isRead),
    [state.notifications]
  );

  const stats = useMemo(() => {
    const paidOrders = state.orders.filter((order) => order.status === 'SUCCESS');
    return {
      paidOrders: paidOrders.length,
      refunds: state.refunds.length,
      savedAddresses: state.addresses.length,
      unlockedTests: state.enrollments.length,
      spend: paidOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0),
    };
  }, [state.addresses.length, state.enrollments.length, state.orders, state.refunds.length]);

  const markNotificationRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setState((current) => ({
        ...current,
        notifications: current.notifications.map((item) => (
          item.id === notificationId ? { ...item, isRead: true } : item
        )),
      }));
    } catch (error) {}
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setState((current) => ({
        ...current,
        notifications: current.notifications.map((item) => ({ ...item, isRead: true })),
      }));
    } catch (error) {}
  };

  if (state.loading) {
    return (
      <Layout>
        <div className="min-h-[70vh] flex items-center justify-center text-slate-500 font-semibold">Loading your dashboard...</div>
      </Layout>
    );
  }

  return (
    
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">My Account Dashboard</h1>
            <p className="mt-2 text-slate-600">
              {state.user?.name ? `Welcome back, ${state.user.name}.` : 'Welcome back.'} Manage your orders, test access, addresses, and notifications in one place.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/orders" className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">My Orders</Link>
            <Link href="/store" className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white">Continue Shopping</Link>
            <button
              type="button"
              onClick={async () => {
                await logout();
                router.push('/login');
              }}
              className="rounded-xl border border-rose-200 bg-rose-100 px-4 py-3 text-sm font-semibold text-rose-700 hover:bg-rose-200"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Paid Orders</p>
            <p className="mt-3 text-3xl font-extrabold text-slate-900">{stats.paidOrders}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Total Spend</p>
            <p className="mt-3 text-3xl font-extrabold text-emerald-600">{formatCurrency(stats.spend)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Unlocked Series</p>
            <p className="mt-3 text-3xl font-extrabold text-slate-900">{stats.unlockedTests}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Saved Addresses</p>
            <p className="mt-3 text-3xl font-extrabold text-slate-900">{stats.savedAddresses}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Unread Alerts</p>
            <p className="mt-3 text-3xl font-extrabold text-amber-600">{unreadNotifications.length}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-8">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">My Test Series</h2>
                  <p className="mt-1 text-sm text-slate-500">All paid digital series unlocked on your account.</p>
                </div>
                <Link href="/test-series" className="text-sm font-semibold text-blue-600">Browse More</Link>
              </div>

              {state.enrollments.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                  <p className="text-slate-500">You have not purchased any test series yet.</p>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {state.enrollments.map((enrollment) => (
                    <div key={enrollment.id} className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-blue-50/60 p-5 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Purchased Series</p>
                        <p className="mt-2 text-xl font-bold text-slate-900">{enrollment.series?.title || 'Unknown series'}</p>
                        <p className="text-sm text-slate-500">{enrollment.series?.tests?.length || 0} tests unlocked</p>
                      </div>
                      {buildTestSeriesTestsPath(enrollment.series?.id) ? (
                        <Link href={buildTestSeriesTestsPath(enrollment.series?.id)} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white">
                          Open Series
                        </Link>
                      ) : (
                        <span className="rounded-xl bg-slate-200 px-5 py-3 text-sm font-semibold text-slate-500">Series Unavailable</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Recent Orders</h2>
                  <p className="mt-1 text-sm text-slate-500">Latest commerce activity across books and test series.</p>
                </div>
                <Link href="/orders" className="text-sm font-semibold text-blue-600">View All Orders</Link>
              </div>

              {state.orders.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                  <p className="text-slate-500">No orders yet.</p>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {state.orders.slice(0, 4).map((order) => (
                    <div key={order.id} className="rounded-2xl border border-slate-100 p-5">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Order ID</p>
                          <p className="font-bold text-slate-900">{order.id}</p>
                          <p className="mt-1 text-sm text-slate-500">{order.orderType} order</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{order.status}</span>
                          {order.shipment?.status ? <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">{order.shipment.status}</span> : null}
                          <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{formatCurrency(order.totalAmount)}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <Link href={`/orders/${order.id}/invoice`} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Invoice</Link>
                        <Link href="/orders" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Track Order</Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Refund Requests</h2>
                  <p className="mt-1 text-sm text-slate-500">Keep track of any refund claims raised on your orders.</p>
                </div>
                <Link href="/orders" className="text-sm font-semibold text-blue-600">Manage Orders</Link>
              </div>

              {state.refunds.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                  <p className="text-slate-500">No refund requests submitted.</p>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {state.refunds.slice(0, 3).map((refund) => (
                    <div key={refund.id} className="rounded-2xl border border-slate-100 p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Refund Request</p>
                          <p className="font-bold text-slate-900">{refund.id}</p>
                          <p className="mt-1 text-sm text-slate-500">Order {refund.orderId}</p>
                        </div>
                        <span className="inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">{refund.status}</span>
                      </div>
                      <p className="mt-3 text-sm text-slate-600">{refund.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="space-y-8">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Notifications</h2>
                  <p className="mt-1 text-sm text-slate-500">Important account and order updates.</p>
                </div>
                {unreadNotifications.length > 0 ? (
                  <button type="button" className="text-sm font-semibold text-blue-600" onClick={markAllRead}>Mark all read</button>
                ) : null}
              </div>

              {state.notifications.length === 0 ? (
                <p className="mt-6 text-sm text-slate-500">No notifications yet.</p>
              ) : (
                <div className="mt-6 space-y-3">
                  {state.notifications.slice(0, 6).map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => markNotificationRead(notification.id)}
                      className={`w-full rounded-2xl border p-4 text-left ${notification.isRead ? 'border-slate-100 bg-slate-50' : 'border-blue-100 bg-blue-50'}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{notification.type}</p>
                          <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
                        </div>
                        {!notification.isRead ? <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-600" /> : null}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">Saved Addresses</h2>
              <p className="mt-1 text-sm text-slate-500">Addresses available during checkout for book purchases.</p>
              {state.addresses.length === 0 ? (
                <p className="mt-6 text-sm text-slate-500">No saved addresses yet. Add one during your next checkout.</p>
              ) : (
                <div className="mt-6 space-y-3">
                  {state.addresses.map((address) => (
                    <div key={address.id} className="rounded-2xl border border-slate-100 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-slate-900">{address.name}</p>
                        {address.isDefault ? <span className="rounded-full bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white">Default</span> : null}
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ''}</p>
                      <p className="text-sm text-slate-500">{address.city}, {address.state} - {address.pincode}</p>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{address.phone}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">Recent Test Attempts</h2>
              <p className="mt-1 text-sm text-slate-500">Your latest performance snapshot.</p>
              {state.testAttempts.length === 0 ? (
                <p className="mt-6 text-sm text-slate-500">No test attempts yet.</p>
              ) : (
                <div className="mt-6 space-y-3">
                  {state.testAttempts.slice(0, 5).map((attempt) => (
                    <div key={attempt.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-900" title={attempt.test?.title}>{attempt.test?.title || 'Untitled Test'}</p>
                          <p className="mt-1 text-sm text-slate-500">Score: {attempt.score}/{attempt.totalQuestions || attempt.test?.totalMarks || 0}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {buildTestResultPath(attempt.id) ? (
                            <Link
                              href={buildTestResultPath(attempt.id)}
                              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                            >
                              View Result
                            </Link>
                          ) : null}
                          {buildTestAttemptPath({ testId: attempt.testId || attempt.test?.id, seriesId: attempt.test?.testSeriesId || attempt.test?.series?.id }) ? (
                            <Link
                              href={buildTestAttemptPath({ testId: attempt.testId || attempt.test?.id, seriesId: attempt.test?.testSeriesId || attempt.test?.series?.id })}
                              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                            >
                              Re-attempt
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    
  );
}
