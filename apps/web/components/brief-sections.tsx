function heading(value: string) {
  return value.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').replace(/^./, (letter) => letter.toUpperCase())
}

function Content({ value }: { value: unknown }) {
  if (value === null || value === undefined) return null
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return <p>{String(value)}</p>
  if (Array.isArray(value)) {
    return <ul>{value.map((item, index) => <li key={index}>{typeof item === 'object' && item !== null ? <Content value={item}/> : String(item)}</li>)}</ul>
  }
  if (typeof value === 'object') {
    return <div className="grid gap-[18px] [&_section+section]:border-t [&_section+section]:border-iq-100 [&_section+section]:pt-[18px] [&_h3]:mt-0 [&_h3]:mb-2 [&_h3]:text-[.96rem] [&_h3]:text-iq-900 [&_p]:m-0">{Object.entries(value).map(([key, item]) => <section key={key}><h3>{heading(key)}</h3><Content value={item}/></section>)}</div>
  }
  return null
}

export function BriefSections({ sections }: { sections: unknown }) {
  if (!sections || typeof sections !== 'object') return <div className="rounded-[15px] border border-dashed border-iq-300 p-[30px] text-center text-iq-600">This brief does not contain structured sections yet.</div>
  return <div className="grid gap-[13px] [&>section]:rounded-[17px] [&>section]:border [&>section]:border-iq-200 [&>section]:bg-white [&>section]:p-[25px] [&>section>p]:mt-0 [&>section>p]:mb-[18px] [&>section>p]:text-[.69rem] [&>section>p]:font-bold [&>section>p]:tracking-[.09em] [&>section>p]:text-brand [&>section>p]:uppercase [&_p]:text-[.9rem] [&_p]:leading-[1.7] [&_p]:text-iq-700 [&_ul]:m-0 [&_ul]:grid [&_ul]:gap-2.5 [&_ul]:pl-5 [&_ul]:text-[.88rem] [&_ul]:leading-[1.6] [&_ul]:text-iq-700">{Object.entries(sections).map(([key, value]) => <section key={key}><p>{heading(key)}</p><Content value={value}/></section>)}</div>
}
