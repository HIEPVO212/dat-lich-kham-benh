drop view if exists public.dashboard_stats;

create view public.dashboard_stats as
select
  (select count(*)::integer from public.appointments) as total_appointments,
  (select count(*)::integer from public.appointments where status = 'confirmed') as confirmed_appointments,
  (select count(*)::integer from public.appointments where status = 'pending') as pending_appointments,
  (select count(*)::integer from public.appointments where status = 'cancelled') as cancelled_appointments,
  (select count(*)::integer from public.doctor) as total_doctors;

grant select on public.dashboard_stats to anon, authenticated;
