import { useState, useEffect, useMemo } from 'react';
import './index.css';

import Toast from './components/Toast';
import AuthModal from './components/AuthModal';
import PaymentModal from './components/PaymentModal';
import ListingModal from './components/ListingModal';
import PropertyDetailsModal from './components/PropertyDetailsModal';
import EditProfileModal from './components/EditProfileModal';
import EditPropertyModal from './components/EditPropertyModal';

const MOCK_PROPERTIES = [
  { id: '1', title: 'Luxury Downtown Apartment', landlord_name: 'Demo Landlord', location: 'New York, NY', description: 'Experience the ultimate luxury in the heart of the city.', rent_amount: 1500, amenities: ['📶 Fast WiFi', '🏋️ Gym', '❄️ AC'], images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'], is_available: true, landlord_id: 'mock' }
];

function App() {
  const [activeTab, setActiveTab] = useState('explore');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Auth ---
  const [user, setUser] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);   // 🔐 secure token
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  // --- Property details / booking ---
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // --- Dashboard ---
  const [dashboardProperties, setDashboardProperties] = useState([]);
  const [dashboardBookings, setDashboardBookings] = useState([]);
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  // --- Payment ---
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [pendingBooking, setPendingBooking] = useState(null);

  // --- Edit ---
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);

  // --- Search & filter ---
  const [searchQuery, setSearchQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const userApiUrl     = import.meta.env.VITE_USER_API_URL     || 'http://localhost:8001/api/users';
  const propertyApiUrl = import.meta.env.VITE_PROPERTY_API_URL || 'http://localhost:8002/api/properties';
  const bookingApiUrl  = import.meta.env.VITE_BOOKING_API_URL  || 'http://localhost:8003/api/bookings';
  const paymentApiUrl  = import.meta.env.VITE_PAYMENT_API_URL  || 'http://localhost:8004/api/payments';

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type: 'success' }), 3000);
  };

  // Helper: build auth headers for protected requests
  const authHeaders = (extra = {}) => ({
    'Content-Type': 'application/json',
    ...(sessionToken ? { 'x-session-token': sessionToken } : {}),
    ...(user?.id     ? { 'x-user-id': user.id } : {}),
    ...extra,
  });

  const fetchAllProperties = (search = searchQuery, price = maxPrice) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search)  params.append('search', search);
    if (price)   params.append('max_price', price);
    fetch(`${propertyApiUrl}?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setProperties(data && data.length > 0 ? data : MOCK_PROPERTIES);
        setLoading(false);
      })
      .catch(() => { setProperties(MOCK_PROPERTIES); setLoading(false); });
  };

  const fetchDashboardData = () => {
    if (user?.role === 'landlord') {
      fetch(`${propertyApiUrl}/landlord/${user.id}`).then(r => r.json()).then(setDashboardProperties).catch(console.error);
      fetch(`${bookingApiUrl}/landlord/${user.id}`).then(r => r.json()).then(setDashboardBookings).catch(console.error);
    } else if (user?.role === 'tenant') {
      fetch(`${bookingApiUrl}/tenant/${user.id}`).then(r => r.json()).then(setDashboardBookings).catch(console.error);
    }
  };

  useEffect(() => { fetchAllProperties(); }, []);
  useEffect(() => { if (user) fetchDashboardData(); }, [user]);

  // --- Auth ---
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    const email    = e.target.email.value;
    const password = e.target.password.value;
    const name     = authMode === 'register' ? e.target.name.value : null;
    const role     = authMode === 'register' ? e.target.role.value : null;

    try {
      const endpoint = authMode === 'register' ? `${userApiUrl}/register` : `${userApiUrl}/login`;
      const payload  = authMode === 'register' ? { name, email, password, role } : { email, password };
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (response.ok) {
        if (authMode === 'login') {
          setUser(data.user);
          setSessionToken(data.session_token);   // 🔐 store the token
        } else {
          // After register, auto-login
          const loginRes  = await fetch(`${userApiUrl}/login`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          const loginData = await loginRes.json();
          setUser(loginData.user);
          setSessionToken(loginData.session_token);
        }
        setAuthModalOpen(false);
        showToast(`Welcome, ${name || data.user?.name}!`);
      } else {
        showToast(data.detail || 'Authentication failed', 'error');
      }
    } catch (err) { showToast('Network error. Is the backend running?', 'error'); }
  };

  const handleLogout = async () => {
    if (sessionToken && user) {
      try {
        await fetch(`${userApiUrl}/logout`, {
          method: 'POST',
          headers: { 'x-user-id': user.id, 'x-session-token': sessionToken }
        });
      } catch (_) {}
    }
    setUser(null);
    setSessionToken(null);
    setActiveTab('explore');
  };

  // --- Edit profile ---
  const handleEditProfile = async (updates) => {
    try {
      const response = await fetch(`${userApiUrl}/${user.id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(updates)
      });
      if (response.ok) {
        const updatedUser = await response.json();
        setUser({ ...user, ...updatedUser });
        setIsEditProfileOpen(false);
        showToast('Profile updated!');
      } else {
        const err = await response.json();
        showToast(err.detail || 'Failed to update profile.', 'error');
      }
    } catch (err) { showToast('Network error.', 'error'); }
  };

  // --- Edit property ---
  const handleEditProperty = async (propertyId, updates) => {
    try {
      const response = await fetch(`${propertyApiUrl}/${propertyId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(updates)
      });
      if (response.ok) {
        showToast('Property updated!');
        setEditingProperty(null);
        fetchDashboardData();
        fetchAllProperties();
      } else {
        const err = await response.json();
        showToast(err.detail || 'Failed to update property.', 'error');
      }
    } catch (err) { showToast('Network error.', 'error'); }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      const response = await fetch(`${propertyApiUrl}/${propertyId}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      if (response.ok || response.status === 204) {
        showToast('Property deleted.');
        fetchDashboardData();
        fetchAllProperties();
      } else {
        const err = await response.json();
        showToast(err.detail || 'Failed to delete.', 'error');
      }
    } catch (err) { showToast('Network error.', 'error'); }
  };

  // --- Booking ---
  const calculatedRent = useMemo(() => {
    if (!startDate || !endDate || !selectedProperty) return 0;
    const diffDays = Math.ceil(Math.abs(new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? Math.round((selectedProperty.rent_amount / 30) * diffDays) : 0;
  }, [startDate, endDate, selectedProperty]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (calculatedRent <= 0) return showToast("Invalid date range.", "error");
    try {
      const response = await fetch(bookingApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: selectedProperty.id,
          landlord_id: selectedProperty.landlord_id,
          tenant_id: user.id,
          start_date: startDate,
          end_date: endDate,
          total_rent_due: calculatedRent
        })
      });
      if (response.ok) {
        showToast('Booking requested!');
        setSelectedProperty(null);
        fetchDashboardData();
        setActiveTab('bookings');
      } else { showToast('Failed to request booking', 'error'); }
    } catch { showToast('Network error', 'error'); }
  };

  const toggleAmenity = (label) =>
    setSelectedAmenities(prev => prev.includes(label) ? prev.filter(a => a !== label) : [...prev, label]);

  // --- Add property (includes landlord_name) ---
  const handleAddProperty = async (e) => {
    e.preventDefault();
    const propType = e.target.property_type.value;
    const payload  = {
      landlord_id:   user.id,
      landlord_name: user.name,           // 🏷️ denormalised name
      title:         `[${propType}] ${e.target.title.value}`,
      description:   e.target.description.value,
      location:      e.target.location.value,
      rent_amount:   parseFloat(e.target.rent_amount.value),
      amenities:     selectedAmenities,
      images:        [e.target.image_url.value || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80']
    };
    try {
      const response = await fetch(propertyApiUrl, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        const newProp = await response.json();
        setDashboardProperties(prev => [...prev, newProp]);
        setIsListingModalOpen(false);
        setSelectedAmenities([]);
        showToast('Property listed!');
        fetchAllProperties();
      } else {
        const err = await response.json();
        showToast(err.detail || 'Failed to add property.', 'error');
      }
    } catch { showToast("Network Error", "error"); }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(paymentApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: pendingBooking.id, amount: pendingBooking.total_rent_due, payment_method: 'credit_card' })
      });
      if (response.ok) {
        showToast('Payment successful! Booking confirmed.');
        setIsPaymentModalOpen(false);
        fetchDashboardData();
      } else { showToast('Payment failed.', 'error'); }
    } catch { showToast('Payment service unavailable.', 'error'); }
  };

  const openPropertyDetails = (property) => {
    setSelectedProperty(property);
    setStartDate('');
    setEndDate('');
  };

  // --- Search bar handler ---
  const handleSearch = (e) => {
    e.preventDefault();
    fetchAllProperties(searchQuery, maxPrice);
  };

  // --- Render ---
  const renderExplore = () => (
    <div className="fade-in">
      {!user && (
        <section className="hero">
          <h1>Find Your Perfect Home</h1>
          <p>Discover premium rental properties tailored for modern living.</p>
        </section>
      )}

      {/* Search & Filter Bar */}
      <form className="search-bar" onSubmit={handleSearch}>
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search by city, state or keyword..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label className="filter-label">Max Price</label>
          <input
            type="number"
            className="filter-input"
            placeholder="Any"
            min="0"
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary">Search</button>
        {(searchQuery || maxPrice) && (
          <button type="button" className="btn btn-secondary" onClick={() => { setSearchQuery(''); setMaxPrice(''); fetchAllProperties('', ''); }}>
            Clear
          </button>
        )}
      </form>

      {loading ? (
        <div className="skeleton-grid">
          {[1, 2, 3].map(i => <div key={i} className="skeleton-card"></div>)}
        </div>
      ) : properties.length === 0 ? (
        <div className="empty-state">🔎 No properties match your search. Try different filters.</div>
      ) : (
        <div className="property-grid">
          {properties.map(property => (
            <div key={property.id} className="property-card" onClick={() => openPropertyDetails(property)}>
              <img src={property.images[0]} alt={property.title} className="property-image" />
              <div className="property-info">
                <h3 className="property-title">{property.title}</h3>
                <div className="property-location">📍 {property.location}</div>
                {property.landlord_name && (
                  <div className="property-landlord">🏠 Listed by <strong>{property.landlord_name}</strong></div>
                )}
                <div className="property-footer">
                  <div className="property-price">${property.rent_amount}<span>/mo</span></div>
                  <button className="btn btn-primary" onClick={e => { e.stopPropagation(); openPropertyDetails(property); }}>View Details</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className={`app ${user ? 'app-authenticated' : ''}`}>
      <Toast toast={toast} />

      {!user ? (
        <>
          <header className="header unauth-header">
            <div className="logo">Rentlora</div>
            <button className="btn btn-primary" onClick={() => { setAuthMode('login'); setAuthModalOpen(true); }}>Login / Register</button>
          </header>
          <main className="main-content-full">{renderExplore()}</main>
        </>
      ) : (
        <>
          <aside className="sidebar">
            <div className="sidebar-logo">Rentlora</div>
            <div className="profile-card">
              <div className="profile-avatar">{user.name.charAt(0).toUpperCase()}</div>
              <h3 className="profile-name">{user.name}</h3>
              <div className={`profile-role ${user.role}`}>{user.role}</div>
              {user.phone && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{user.phone}</p>}
              <button
                className="btn"
                style={{ marginTop: '0.75rem', fontSize: '0.75rem', padding: '0.35rem 0.75rem', background: 'rgba(255,255,255,0.1)', color: 'white', width: '100%' }}
                onClick={() => setIsEditProfileOpen(true)}
              >
                ✏️ Edit Profile
              </button>
            </div>

            <nav className="sidebar-nav">
              <div className="nav-section">MAIN</div>
              <button className={activeTab === 'explore' ? 'active' : ''} onClick={() => setActiveTab('explore')}>🌍 Explore Properties</button>
              <div className="nav-section" style={{ marginTop: '1.5rem' }}>DASHBOARD</div>
              {user.role === 'landlord' && (
                <button className={activeTab === 'properties' ? 'active' : ''} onClick={() => setActiveTab('properties')}>🏡 My Properties</button>
              )}
              <button className={activeTab === 'bookings' ? 'active' : ''} onClick={() => setActiveTab('bookings')}>📅 My Bookings</button>
            </nav>

            <button className="logout-btn" onClick={handleLogout}>Log out</button>
          </aside>

          <main className="main-content-auth">
            <header className="auth-header">
              <h2>{activeTab === 'explore' ? 'Explore Properties' : activeTab === 'properties' ? 'My Properties' : 'My Bookings'}</h2>
              {user.role === 'landlord' && activeTab === 'properties' && (
                <button className="btn btn-primary" onClick={() => setIsListingModalOpen(true)}>+ List Property</button>
              )}
            </header>

            <div className="content-area">
              {activeTab === 'explore' && renderExplore()}

              {activeTab === 'properties' && user.role === 'landlord' && (
                <div className="fade-in">
                  <div className="overview-grid" style={{ marginBottom: '2rem' }}>
                    <div className="stat-card"><h4>Total Properties</h4><div className="stat-value">{dashboardProperties.length}</div></div>
                  </div>
                  <div className="table-container">
                    {dashboardProperties.length === 0 ? (
                      <div className="empty-state">🏡 You haven't listed any properties yet.</div>
                    ) : (
                      <table className="data-table">
                        <thead><tr><th>Property</th><th>Location</th><th>Rent/mo</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                          {dashboardProperties.map(p => (
                            <tr key={p.id}>
                              <td><strong>{p.title}</strong></td>
                              <td>{p.location}</td>
                              <td>${p.rent_amount}</td>
                              <td><span className={`status-badge ${p.is_available ? 'success' : 'warning'}`}>{p.is_available ? 'Available' : 'Booked'}</span></td>
                              <td style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="btn" style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem', background: 'rgba(99,102,241,0.15)', color: '#818cf8' }} onClick={() => setEditingProperty(p)}>✏️ Edit</button>
                                <button className="btn" style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem', background: 'rgba(239,68,68,0.15)', color: '#f87171' }} onClick={() => handleDeleteProperty(p.id)}>🗑️ Delete</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'bookings' && (
                <div className="fade-in">
                  <div className="overview-grid" style={{ marginBottom: '2rem' }}>
                    <div className="stat-card"><h4>Total Bookings</h4><div className="stat-value">{dashboardBookings.length}</div></div>
                  </div>
                  <div className="table-container">
                    {dashboardBookings.length === 0 ? (
                      <div className="empty-state">📅 No bookings found.</div>
                    ) : (
                      <table className="data-table">
                        <thead><tr><th>ID</th><th>Dates</th><th>Total</th><th>Status</th><th>Payment</th>{user.role === 'tenant' && <th>Action</th>}</tr></thead>
                        <tbody>
                          {dashboardBookings.map(b => (
                            <tr key={b.id}>
                              <td>{b.id.substring(0, 6)}...</td>
                              <td>{b.start_date} to {b.end_date}</td>
                              <td><strong>${b.total_rent_due}</strong></td>
                              <td><span className={`status-badge ${b.status === 'pending' ? 'warning' : 'success'}`}>{b.status}</span></td>
                              <td><span className={`status-badge ${b.payment_status === 'pending' ? 'warning' : 'success'}`}>{b.payment_status}</span></td>
                              {user.role === 'tenant' && (
                                <td>
                                  {b.payment_status === 'pending' && (
                                    <button className="btn btn-pay" onClick={() => { setPendingBooking(b); setIsPaymentModalOpen(true); }}>Pay Now</button>
                                  )}
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}
            </div>
          </main>
        </>
      )}

      <AuthModal authModalOpen={authModalOpen} setAuthModalOpen={setAuthModalOpen} authMode={authMode} setAuthMode={setAuthMode} handleAuthSubmit={handleAuthSubmit} />
      <PaymentModal isPaymentModalOpen={isPaymentModalOpen} setIsPaymentModalOpen={setIsPaymentModalOpen} pendingBooking={pendingBooking} handlePaymentSubmit={handlePaymentSubmit} />
      <ListingModal isListingModalOpen={isListingModalOpen} setIsListingModalOpen={setIsListingModalOpen} handleAddProperty={handleAddProperty} selectedAmenities={selectedAmenities} toggleAmenity={toggleAmenity} showToast={showToast} />
      <PropertyDetailsModal selectedProperty={selectedProperty} setSelectedProperty={setSelectedProperty} user={user} setAuthMode={setAuthMode} setAuthModalOpen={setAuthModalOpen} startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate} calculatedRent={calculatedRent} handleBookingSubmit={handleBookingSubmit} />
      <EditProfileModal user={user} isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} onSave={handleEditProfile} />
      <EditPropertyModal property={editingProperty} isOpen={!!editingProperty} onClose={() => setEditingProperty(null)} onSave={handleEditProperty} />
    </div>
  );
}

export default App;
