export default function EmptyState({ title = "No data", description }) {
  return (
    <div className="empty">
      <div className="empty-title">{title}</div>
      {description && <div className="empty-desc">{description}</div>}
    </div>
  );
}
