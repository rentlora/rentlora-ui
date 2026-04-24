export default function Toast({ toast }) {
  return (
    <div className={`toast-container ${toast.visible ? 'show' : ''}`}>
      <div className={`toast ${toast.type}`}>
        {toast.type === 'success' ? '✅ ' : '❌ '}
        {toast.message}
      </div>
    </div>
  );
}
