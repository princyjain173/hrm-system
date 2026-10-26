export const Badge = ({ s }) => <span className={`badge ${s}`}>{s}</span>;
export const Empty = ({ children }) => <div className="empty">{children}</div>;
export const Pager = ({ page, pages, setPage }) => pages > 1 ? (
  <div className="pager"><button className="btn ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
    <span>Page {page} of {pages}</span><button className="btn ghost" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button></div>) : null;
export const Head = ({ title, sub, children }) => <header className="head"><div><h1>{title}</h1>{sub && <p>{sub}</p>}</div><div>{children}</div></header>;
