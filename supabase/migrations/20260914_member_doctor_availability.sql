create or replace function public.set_doctor_availability(
  p_doctor_id bigint,
  p_available boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_staff() then
    raise exception 'Only admin or member can change doctor availability';
  end if;

  update public.doctor
  set available = p_available,
      is_accepting_bookings = p_available
  where doctor_id = p_doctor_id;
end;
$$;

revoke all on function public.set_doctor_availability(bigint, boolean) from public;
grant execute on function public.set_doctor_availability(bigint, boolean) to authenticated;