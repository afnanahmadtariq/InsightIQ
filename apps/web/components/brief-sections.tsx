import styles from './library.module.css'

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
    return <div className={styles.nestedSections}>{Object.entries(value).map(([key, item]) => <section key={key}><h3>{heading(key)}</h3><Content value={item}/></section>)}</div>
  }
  return null
}

export function BriefSections({ sections }: { sections: unknown }) {
  if (!sections || typeof sections !== 'object') return <div className={styles.emptySection}>This brief does not contain structured sections yet.</div>
  return <div className={styles.briefSections}>{Object.entries(sections).map(([key, value]) => <section key={key}><p>{heading(key)}</p><Content value={value}/></section>)}</div>
}
