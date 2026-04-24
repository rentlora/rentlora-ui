export default function EditProfileModal({ user, isOpen, onClose, onSave }) {
  if (!isOpen || !user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updates = {
      name: e.target.name.value,
      phone: e.target.phone.value,
      bio: e.target.bio.value,
    };
    await onSave(updates);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Profile</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.875rem' }}>{user.email} · {user.role}</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" name="name" className="form-control" defaultValue={user.name} required />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="tel" name="phone" className="form-control" defaultValue={user.phone || ''} placeholder="+1 (555) 000-0000" />
          </div>
          <div className="form-group">
            <label>Bio</label>
            <textarea name="bio" className="form-control" rows="3" defaultValue={user.bio || ''} placeholder="Tell landlords or tenants a bit about yourself..." />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ marginRight: '0.5rem' }}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}
