'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import PageLayout from '../../components/PageLayout'
import { getSpecialties, type Specialty } from '../../lib/specialties'

const specialtyAccents = [
  'from-cyan-500 to-sky-600',
  'from-emerald-500 to-teal-600',
  'from-violet-500 to-purple-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-indigo-500 to-blue-700',
  'from-teal-500 to-cyan-600',
  'from-fuchsia-500 to-violet-600',
  'from-sky-500 to-cyan-600',
  'from-emerald-500 to-lime-600',
  'from-pink-500 to-rose-600',
  'from-violet-600 to-indigo-700',
]

const filters = ['Tất cả', 'Tim mạch', 'Nội khoa', 'Nhi khoa', 'Phụ khoa', 'Mắt']

export default function SpecialtyPage() {
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('Tất cả')

  useEffect(() => {
    let isMounted = true

    getSpecialties()
      .then((data) => {
        if (isMounted) {
          setSpecialties(data)
          setError(null)
        }
      })
      .catch((loadError: unknown) => {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Không thể tải danh sách chuyên khoa.')
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const filteredSpecialties = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query && selectedFilter === 'Tất cả') {
      return specialties
    }

    return specialties.filter((specialty) => {
      const matchesSearch =
        !query ||
        specialty.specialty_name.toLocaleLowerCase('vi').includes(query) ||
        specialty.description.toLocaleLowerCase('vi').includes(query)

      const matchesFilter =
        selectedFilter === 'Tất cả' ||
        specialty.specialty_name.toLocaleLowerCase('vi').includes(selectedFilter.toLocaleLowerCase('vi')) ||
        (selectedFilter === 'Nội khoa' && specialty.specialty_name.toLocaleLowerCase('vi').includes('nội')) ||
        (selectedFilter === 'Phụ khoa' && specialty.specialty_name.toLocaleLowerCase('vi').includes('sản')) ||
        (selectedFilter === 'Mắt' && specialty.specialty_name.toLocaleLowerCase('vi').includes('mắt'))

      return matchesSearch && matchesFilter
    })
  }, [search, selectedFilter, specialties])

  return (
    <PageLayout>
      <div className="space-y-8">
        <div className="mb-4 rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex rounded-full bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700">
                Chuyên khoa
              </div>
              <h1 className="mt-4 text-3xl font-black text-slate-900 sm:text-4xl">
                Tất cả chuyên khoa đang có tại HEALTHCONNECT
              </h1>
            </div>
            <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">
              {loading ? 'Đang tải...' : `${specialties.length} chuyên khoa`}
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-[24px] border border-red-200 bg-red-50 p-6 text-center text-red-700">
            {error}
          </div>
        )}

        {loading && (
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-10 text-center text-slate-600">
            Đang tải danh sách chuyên khoa...
          </div>
        )}

        <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm kiếm chuyên khoa..."
              className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-cyan-300 focus:bg-white lg:max-w-md"
            />

            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setSelectedFilter(filter)}
                  className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                    selectedFilter === filter
                      ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-cyan-200 hover:text-cyan-700'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredSpecialties.map((specialty, index) => (
            <div
              key={specialty.specialty_id}
              className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-xl"
            >
              <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${specialtyAccents[index % specialtyAccents.length]} shadow-lg`}>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-[10px] font-black text-slate-700">
                  {specialty.specialty_name
                    .split(' ')
                    .slice(0, 2)
                    .map((word) => word[0])
                    .join('')
                    .slice(0, 2)}
                </div>
              </div>

              <h2 className="text-xl font-bold text-slate-900">{specialty.specialty_name}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{specialty.description}</p>

              <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4">
                <span className="text-sm font-medium text-cyan-700">Đặt lịch khám</span>
                <Link
                  href="/booking"
                  className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  Đặt lịch
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredSpecialties.length === 0 && (
          <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-600">
            Không tìm thấy chuyên khoa phù hợp với từ khóa bạn đang tìm.
          </div>
        )}

        <div className="rounded-[30px] bg-gradient-to-r from-cyan-600 via-cyan-700 to-blue-700 p-8 text-white shadow-[0_30px_80px_rgba(14,116,144,0.35)] sm:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-100">Hỗ trợ nhanh</div>
              <h2 className="mt-3 text-3xl font-black">Bạn chưa biết nên chọn chuyên khoa nào?</h2>
            </div>
            <Link
              href="/contact"
              className="!text-white inline-flex items-center justify-center rounded-full border border-white/80 bg-transparent px-6 py-3 text-base font-semibold transition hover:bg-white/10"
            >
              Liên hệ tư vấn
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
