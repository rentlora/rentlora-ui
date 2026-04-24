export default function PropertyDetailsModal({
  selectedProperty,
  setSelectedProperty,
  user,
  setAuthMode,
  setAuthModalOpen,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  calculatedRent,
  handleBookingSubmit
}) {
  if (!selectedProperty) return null;

  return (
    <div className="details-overlay fade-in">
      <div className="details-container">
        <button className="details-close" onClick={() => setSelectedProperty(null)}>✕ Close</button>
        
        <div className="details-layout">
          {/* Left Column: Showcase */}
          <div className="details-showcase">
            <img src={selectedProperty.images[0]} alt={selectedProperty.title} className="details-hero-image" />
            
            <div className="details-content">
              <h1 className="details-title">{selectedProperty.title}</h1>
              <p className="details-location">📍 {selectedProperty.location}</p>
              
              <hr className="details-divider" />
              
              <div className="details-section">
                <h3>About this space</h3>
                <p className="details-description">{selectedProperty.description || "A beautiful property perfect for your next stay. Relax and enjoy the amazing surroundings in absolute comfort."}</p>
              </div>
              
              <hr className="details-divider" />

              <div className="details-section">
                <h3>What this place offers</h3>
                {(!selectedProperty.amenities || selectedProperty.amenities.length === 0) ? (
                  <p className="details-description">Amenities not listed.</p>
                ) : (
                  <div className="details-amenities-grid">
                    {selectedProperty.amenities.map((a, i) => (
                      <div key={i} className="details-amenity-item">✔️ {a}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Booking Action Panel */}
          <div className="details-action-panel-container">
            <div className="details-action-panel">
              <div className="panel-price-header">
                <span className="panel-price">${selectedProperty.rent_amount}</span> / month
              </div>

              {!user ? (
                <div className="panel-auth-prompt">
                  <p>You must be logged in to book this property.</p>
                  <button className="btn btn-primary" style={{width: '100%', marginTop: '1rem'}} onClick={() => { setAuthMode('login'); setAuthModalOpen(true); }}>Login to Book</button>
                </div>
              ) : user.role === 'landlord' ? (
                <div className="panel-auth-prompt warning">
                  <p><strong>Note:</strong> You are logged in as a Landlord.</p>
                  <p style={{marginTop: '0.5rem', fontSize: '0.875rem'}}>Landlords can list properties but cannot book them. Please register a Tenant account to book.</p>
                </div>
              ) : (
                <form className="panel-booking-form" onSubmit={handleBookingSubmit}>
                  <div className="panel-date-picker">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Check-in</label>
                      <input type="date" className="form-control" required value={startDate} onChange={e => setStartDate(e.target.value)} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Checkout</label>
                      <input type="date" className="form-control" required value={endDate} onChange={e => setEndDate(e.target.value)} />
                    </div>
                  </div>

                  {calculatedRent > 0 ? (
                    <>
                      <div className="panel-price-breakdown">
                        <div className="breakdown-row">
                          <span>${selectedProperty.rent_amount} x {(Math.ceil(Math.abs(new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) / 30).toFixed(1)} months</span>
                          <span>${calculatedRent}</span>
                        </div>
                        <div className="breakdown-row">
                          <span>Rentlora service fee</span>
                          <span>$0</span>
                        </div>
                      </div>
                      <hr className="details-divider" style={{margin: '1rem 0'}}/>
                      <div className="breakdown-row total">
                        <span>Total</span>
                        <span>${calculatedRent}</span>
                      </div>
                    </>
                  ) : (
                    <p className="panel-hint">Select dates to see total price.</p>
                  )}

                  <button type="submit" className="btn btn-pay btn-block" disabled={calculatedRent <= 0} style={{width: '100%', marginTop: '1.5rem', padding: '1rem', fontSize: '1rem'}}>
                    Reserve Now
                  </button>
                  <p className="panel-hint" style={{textAlign: 'center', marginTop: '1rem'}}>You won't be charged yet</p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
