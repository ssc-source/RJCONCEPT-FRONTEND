function formatDisplayDate(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) {
    return new Date().toLocaleDateString('en-IN');
  }
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

const defaultInstitution = {
  name: 'RJ Concept',
  address: 'DIG Chowk, Purnia, Bihar, India',
  phone: '+91 9876543210',
  email: 'info@rjconcept.com',
  website: 'www.rjconcept.in',
  logoUrl: '/assets/logo.png',
};

export default function DocumentTemplate({
  title,
  columns = [],
  rows = [],
  metadata = [],
  institution = {},
  generatedAt,
  footerNote = 'This is a system generated document.',
  headerClassName = 'grid grid-cols-[1.2fr_auto_1fr] items-start border-b border-slate-200 pb-4',
  logoClassName = 'h-18 w-18 rounded object-contain',
}) {
  const org = { ...defaultInstitution, ...(institution || {}) };

  return (
    <div className="w-[794px] bg-white p-8 text-slate-900">
      <header className={headerClassName}>
        <div>
          <div>
            <p className="text-xl font-extrabold">{org.name}</p>
            <p className="text-xs text-slate-600">{org.address}</p>
            <p className="text-xs text-slate-600">Phone: {org.phone}</p>
            <p className="text-xs text-slate-600">Email: {org.email}</p>
          </div>
        </div>
        <div className="flex justify-center">
          <img
            src={org.logoUrl}
            alt="RJ Concept"
            className={logoClassName}
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />
        </div>
        <div className="text-right text-xs text-slate-600">
          <p>Date: {formatDisplayDate(generatedAt)}</p>
        </div>
      </header>

      <section className="py-5 text-center">
        <h1 className="text-2xl font-extrabold tracking-wide">{title}</h1>
      </section>

      {metadata.length ? (
        <section className="mb-4 grid grid-cols-2 gap-x-8 gap-y-2 rounded border border-slate-200 bg-slate-50 p-4 text-sm">
          {metadata.map((item) => (
            <div key={`${item.label}-${item.value}`} className="flex justify-between gap-3">
              <span className="font-semibold text-slate-700">{item.label}</span>
              <span className="text-slate-900">{item.value}</span>
            </div>
          ))}
        </section>
      ) : null}

      <section>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-100">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`border border-slate-200 px-3 py-2 font-semibold ${column.align === 'right' ? 'text-right' : 'text-left'}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length ? rows.map((row, rowIndex) => (
              <tr key={`${rowIndex}-${String(row[columns[0]?.key] || 'row')}`}>
                {columns.map((column) => (
                  <td
                    key={`${column.key}-${rowIndex}`}
                    className={`border border-slate-200 px-3 py-2 ${column.align === 'right' ? 'text-right' : 'text-left'}`}
                  >
                    {row[column.key] ?? '-'}
                  </td>
                ))}
              </tr>
            )) : (
              <tr>
                <td colSpan={Math.max(columns.length, 1)} className="border border-slate-200 px-3 py-6 text-center text-slate-500">
                  No records available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <footer className="mt-8 border-t border-slate-200 pt-4 text-xs text-slate-600">
        <p>Contact: {org.phone} | {org.email}</p>
        <p>Website: {org.website}</p>
        <p className="mt-1">{footerNote}</p>
      </footer>
    </div>
  );
}
