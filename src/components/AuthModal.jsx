export default function AuthModal({ authModalOpen, setAuthModalOpen, authMode, setAuthMode, handleAuthSubmit }) {
  if (!authModalOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => setAuthModalOpen(false)}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{authMode === 'login' ? 'Welcome Back' : 'Create an Account'}</h2>
        </div>
        <form onSubmit={handleAuthSubmit}>
          {authMode === 'register' && (
            <>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" name="name" className="form-control" required />
              </div>
              <div className="form-group">
                <label>I am a...</label>
                <select name="role" className="form-control" required>
                  <option value="tenant">Tenant (Looking to rent)</option>
                  <option value="landlord">Landlord (Looking to list)</option>
                </select>
              </div>
            </>
          )}
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" className="form-control" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" className="form-control" required />
          </div>
          <div className="modal-actions" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="toggle-link" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>
              {authMode === 'login' ? 'Need an account? Register' : 'Already have an account? Login'}
            </span>
            <button type="submit" className="btn btn-primary">{authMode === 'login' ? 'Login' : 'Register'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
