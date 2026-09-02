function heading(value: string) {
  return value.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').replace(/^./, (letter) => letter.toUpperCase())
}

function Content({ value }: { value: unknown }) {
  if (value === null || value === undefined) return null
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return <p className="m-0 text-sm leading-relaxed text-iq-700">{String(value)}</p>
  if (Array.isArray(value)) {
    return <ul className="m-0 grid gap-2.5 pl-5 text-sm leading-relaxed text-iq-700">{value.map((item, index) => <li key={index}>{typeof item === 'object' && item !== null ? <Content value={item}/> : String(item)}</li>)}</ul>
  }
  if (typeof value === 'object') {
    return <div className="grid gap-[18px]">{Object.entries(value).map(([key, item]) => <section className="border-t border-iq-100 pt-[18px] first:border-0 first:pt-0" key={key}><h3 className="mt-0 mb-2 text-base text-iq-900">{heading(key)}</h3><Content value={item}/></section>)}</div>
  }
  return null
}

export function BriefSections({ sections }: { sections: unknown }) {
  if (!sections || typeof sections !== 'object') return <div className="rounded-[15px] border border-dashed border-iq-300 p-[30px] text-center text-iq-600">This brief does not contain structured sections yet.</div>
  return <div className="grid gap-3.5">{Object.entries(sections).map(([key, value]) => <section className="rounded-[17px] border border-iq-200 bg-white p-6" key={key}><p className="mt-0 mb-[18px] text-xs font-bold tracking-widest text-brand uppercase">{heading(key)}</p><Content value={value}/></section>)}</div>
}
