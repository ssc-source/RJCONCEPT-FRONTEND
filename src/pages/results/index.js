// import { useEffect, useState } from 'react';
// import api from '../../services/api';
// import { resolveMediaUrl } from '../../utils/media';

// const CARD_LIMIT = 4;
// const palette = [
//   'from-blue-100 to-blue-50 text-blue-700',
//   'from-emerald-100 to-emerald-50 text-emerald-700',
//   'from-violet-100 to-violet-50 text-violet-700',
//   'from-amber-100 to-amber-50 text-amber-700',
// ];

// const getInitials = (name) => (
//   (name || 'RJ')
//     .split(' ')
//     .filter(Boolean)
//     .slice(0, 2)
//     .map((part) => part[0]?.toUpperCase() || '')
//     .join('')
// );

// export default function ResultsPage() {
//   const [groups, setGroups] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [loadingExam, setLoadingExam] = useState('');

//   useEffect(() => {
//     api.get('/results/public', { params: { limit: CARD_LIMIT } })
//       .then((response) => setGroups(response.data || []))
//       .catch(() => setGroups([]))
//       .finally(() => setLoading(false));
//   }, []);

//   const loadMore = async (examName) => {
//     const currentGroup = groups.find((group) => group.examName === examName);
//     if (!currentGroup || loadingExam) return;

//     setLoadingExam(examName);
//     try {
//       const nextPage = Number(currentGroup.meta?.page || 1) + 1;
//       const response = await api.get('/results/public', {
//         params: { examName, page: nextPage, limit: CARD_LIMIT },
//       });

//       setGroups((current) => current.map((group) => {
//         if (group.examName !== examName) return group;
//         return {
//           ...group,
//           items: [...group.items, ...(response.data || [])],
//           meta: response.meta || group.meta,
//         };
//       }));
//     } catch (error) {
//       alert(error.message || 'Unable to load more results');
//     } finally {
//       setLoadingExam('');
//     }
//   };

//   return (
//     <div className="min-h-[80vh] bg-slate-50 py-16">
//       <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//         <div className="mx-auto mb-14 max-w-3xl text-center">
//           <h1 className="text-4xl font-extrabold text-blue-900 md:text-5xl">Hall of Fame</h1>
//           <p className="mt-5 text-lg leading-8 text-slate-600 md:text-xl">
//             Our achievers are building careers across competitive exams, government services, and high-stakes selections.
//             Explore success stories grouped by exam.
//           </p>
//         </div>

//         {loading ? (
//           <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center text-slate-500 shadow-sm">
//             Loading result highlights...
//           </div>
//         ) : null}

//         {!loading && groups.length === 0 ? (
//           <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center text-slate-500 shadow-sm">
//             Result highlights will appear here soon.
//           </div>
//         ) : null}

//         <div className="space-y-12">
//           {groups.map((group, groupIndex) => (
//             <section key={group.examName} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
//               <div className="mb-8 flex flex-col gap-3 border-b border-slate-100 pb-5 md:flex-row md:items-end md:justify-between">
//                 <div>
//                   <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">Exam Category</p>
//                   <h2 className="mt-2 text-3xl font-extrabold text-slate-900">{group.examName}</h2>
//                   <p className="mt-2 text-sm text-slate-500">{group.meta?.total || group.items.length} achiever{(group.meta?.total || group.items.length) === 1 ? '' : 's'} showcased</p>
//                 </div>
//                 {group.meta?.hasMore ? (
//                   <button
//                     type="button"
//                     className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
//                     onClick={() => loadMore(group.examName)}
//                   >
//                     {loadingExam === group.examName ? 'Loading...' : 'See More'}
//                   </button>
//                 ) : null}
//               </div>

//               <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
//                 {group.items.map((item, itemIndex) => {
//                   const paletteClass = palette[(groupIndex + itemIndex) % palette.length];
//                   const detailLabel = item.achievementTitle || item.rank || item.note || 'Achiever';
//                   const footLabel = item.batchLabel || item.yearLabel || item.rank || 'RJ Concept Achiever';

//                   return (
//                     <article key={item.id} className="rounded-3xl border border-slate-100 bg-slate-50/70 p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md">
//                       <div className={`mx-auto mb-5 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gradient-to-br ${paletteClass} text-2xl font-bold shadow-sm`}>
//                         {item.displayPhotoUrl ? (
//                           <img src={resolveMediaUrl(item.displayPhotoUrl)} alt={item.displayName} className="h-full w-full object-cover" />
//                         ) : (
//                           <span>{getInitials(item.displayName)}</span>
//                         )}
//                       </div>
//                       <h3 className="text-2xl font-extrabold text-slate-900">{item.displayName}</h3>
//                       <p className="mt-2 text-lg font-bold text-blue-700">{detailLabel}</p>
//                       {item.note ? <p className="mt-3 min-h-[48px] text-sm leading-6 text-slate-600">{item.note}</p> : <div className="mt-3 min-h-[48px]" />}
//                       <span className="mt-4 inline-flex rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
//                         {footLabel}
//                       </span>
//                     </article>
//                   );
//                 })}
//               </div>
//             </section>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }



import { useEffect, useState } from 'react';
import api from '../../services/api';
import { handleMediaError, resolveMediaUrl } from '../../utils/media';

const CARD_LIMIT = 5;

const palette = [
  'from-blue-100 to-blue-50 text-blue-700',
  'from-emerald-100 to-emerald-50 text-emerald-700',
  'from-violet-100 to-violet-50 text-violet-700',
  'from-amber-100 to-amber-50 text-amber-700',
];

const getInitials = (name) =>
  (name || 'RJ')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');

export default function ResultsPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingExam, setLoadingExam] = useState('');

  useEffect(() => {
    api
      .get('/results/public', { params: { limit: CARD_LIMIT } })
      .then((response) => setGroups(response.data || []))
      .catch(() => setGroups([]))
      .finally(() => setLoading(false));
  }, []);

  const loadMore = async (examName) => {
    const currentGroup = groups.find(
      (group) => group.examName === examName
    );

    if (!currentGroup || loadingExam) return;

    setLoadingExam(examName);

    try {
      const nextPage =
        Number(currentGroup.meta?.page || 1) + 1;

      const response = await api.get(
        '/results/public',
        {
          params: {
            examName,
            page: nextPage,
            limit: CARD_LIMIT,
          },
        }
      );

      setGroups((current) =>
        current.map((group) => {
          if (group.examName !== examName)
            return group;

          return {
            ...group,
            items: [
              ...group.items,
              ...(response.data || []),
            ],
            meta:
              response.meta || group.meta,
          };
        })
      );
    } catch (error) {
      alert(
        error.message ||
          'Unable to load more results'
      );
    } finally {
      setLoadingExam('');
    }
  };

  return (
    <div className="min-h-[80vh] bg-slate-50 py-10">
      <div className="mx-auto max-w-7xl px-6">

        {/* Header */}

        <div className="mx-auto mb-14 max-w-3xl text-center">
          <h1 className="text-4xl font-extrabold text-blue-900 md:text-5xl">Hall of Fame</h1>
          <p className="mt-5 text-lg leading-8 text-slate-600 md:text-xl">
            Our achievers are building careers across competitive exams, government services, and high-stakes selections.
            Explore success stories grouped by exam.
          </p>
        </div>


        {/* Loading */}

        {loading && (
          <div className="rounded-xl border bg-white py-10 text-center text-sm text-slate-500 shadow-sm">
            Loading result highlights...
          </div>
        )}


        {/* Empty */}

        {!loading && groups.length === 0 && (
          <div className="rounded-xl border bg-white py-10 text-center text-sm text-slate-500 shadow-sm">
            Result highlights will appear soon.
          </div>
        )}


        {/* Groups */}

        <div className="space-y-6">

          {groups.map((group, groupIndex) => (

            <section
              key={group.examName}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
            >

              {/* Exam Header */}

            <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">

              <div>

                <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 mb-1">
                  Exam Category
                </p>

                <div className="flex items-center gap-3">

                  <h2 className="text-lg font-semibold text-slate-800">
                    {group.examName} Results
                  </h2>

                  <span className="
                  text-[11px]
                  bg-slate-100
                  text-slate-600
                  px-2
                  py-0.5
                  rounded-md
                  font-medium
                  ">
                    {group.meta?.total || group.items.length} Achievers
                  </span>

                </div>

              </div>


              {group.meta?.hasMore && (

                <button
                  type="button"
                  onClick={() => loadMore(group.examName)}

                  className="
                  text-xs
                  font-semibold
                  px-3
                  py-1.5
                  rounded-md
                  border
                  border-blue-200
                  text-blue-700
                  hover:bg-blue-600
                  hover:text-white
                  transition
                  "

                >

                  {loadingExam === group.examName
                    ? 'Loading...'
                    : 'View All'}

                </button>

              )}

            </div>


              {/* Result Grid */}

              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">

                {group.items.map(
                  (item, itemIndex) => {

                    const paletteClass =
                      palette[
                        (groupIndex +
                          itemIndex) %
                          palette.length
                      ];

                    const detailLabel =
                      item.achievementTitle ||
                      item.rank ||
                      item.note ||
                      'Achiever';

                    const footLabel =
                      item.batchLabel ||
                      item.yearLabel ||
                      item.rank ||
                      'RJ Concept Achiever';

                    return (

                      <article
                        key={item.id}
                        className="rounded-xl border border-slate-200 bg-white p-4 text-center transition hover:-translate-y-1 hover:shadow-md"
                      >

                        {/* Photo */}

                        <div
                          className={`
                          mx-auto mb-3
                          flex h-16 w-16
                          items-center justify-center
                          overflow-hidden rounded-full
                          border bg-gradient-to-br
                          ${paletteClass}
                          text-sm font-bold shadow-sm
                        `}
                        >

                          {item.image || item.displayPhotoUrl ? (

                            <img
                              src={resolveMediaUrl(
                                item.image || item.displayPhotoUrl
                              )}
                              onError={handleMediaError}
                              alt={item.displayName}
                              className="h-full w-full object-cover"
                            />

                          ) : (

                            <span>
                              {getInitials(
                                item.displayName
                              )}
                            </span>

                          )}

                        </div>


                        {/* Name */}

                        <h3 className="text-sm font-semibold text-slate-800">
                          {item.displayName}
                        </h3>


                        {/* Achievement */}

                        <p className="mt-1 text-xs font-semibold text-blue-600">
                          {detailLabel}
                        </p>


                        {/* Note */}

                        {item.note && (

                          <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                            {item.note}
                          </p>

                        )}


                        {/* Footer Badge */}

                        <span className="mt-2 inline-block rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">

                          {footLabel}

                        </span>

                      </article>

                    );

                  }
                )}

              </div>

            </section>

          ))}

        </div>

      </div>

    </div>
  );
}
