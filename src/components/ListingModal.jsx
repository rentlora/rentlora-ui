import { useState } from 'react';

const AMENITY_OPTIONS = [
  { id: 'wifi', label: '📶 Fast WiFi' },
  { id: 'pool', label: '🏊 Pool' },
  { id: 'gym', label: '🏋️ Gym' },
  { id: 'parking', label: '🚗 Parking' },
  { id: 'ac', label: '❄️ AC' },
  { id: 'pets', label: '🐾 Pets Allowed' }
];

export default function ListingModal({ 
  isListingModalOpen, 
  setIsListingModalOpen, 
  handleAddProperty, 
  selectedAmenities, 
  toggleAmenity,
  showToast
}) {
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimatedRent, setEstimatedRent] = useState('');

  if (!isListingModalOpen) return null;

  const handleEstimateRent = async (e) => {
    e.preventDefault();
    const form = e.target.closest('form');
    const location = form.location.value;
    const propertyType = form.property_type.value;
    
    if (!location) {
      return showToast('Please enter a location first to estimate rent.', 'warning');
    }

    setIsEstimating(true);
    showToast('AI is analyzing market data...', 'success');

    try {
      const aiApiUrl = import.meta.env.VITE_AI_API_URL || 'http://localhost:8005/api/ai';
      const response = await fetch(`${aiApiUrl}/estimate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location,
          property_type: propertyType,
          amenities: selectedAmenities
        })
      });

      if (response.ok) {
        const data = await response.json();
        setEstimatedRent(data.estimated_rent);
        showToast('AI estimated the optimal rent!', 'success');
      } else {
        showToast('Failed to get AI estimation.', 'error');
      }
    } catch (err) {
      showToast('AI Service is unavailable.', 'error');
    } finally {
      setIsEstimating(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setIsListingModalOpen(false)}>
      <div className="modal-content large" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>List a New Property</h2></div>
        <form onSubmit={handleAddProperty}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Property Type</label>
              <select name="property_type" className="form-control" required>
                <option value="Apartment">Apartment</option>
                <option value="House">House</option>
                <option value="Villa">Villa</option>
                <option value="Studio">Studio</option>
              </select>
            </div>
            <div className="form-group" style={{ flex: 2 }}>
              <label>Title</label>
              <input type="text" name="title" className="form-control" required placeholder="Cozy Downtown Unit" />
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" className="form-control" required rows="4" placeholder="Describe the amazing features..."></textarea>
          </div>
          
          <div className="form-group">
            <label>Location</label>
            <input type="text" name="location" className="form-control" required placeholder="City, State" />
          </div>

          <div className="form-group">
            <label>Select Amenities</label>
            <div className="amenities-grid">
              {AMENITY_OPTIONS.map(a => (
                <div 
                  key={a.id} 
                  className={`amenity-badge ${selectedAmenities.includes(a.label) ? 'selected' : ''}`}
                  onClick={() => toggleAmenity(a.label)}
                >
                  {a.label}
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Monthly Rent ($)</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input type="number" name="rent_amount" className="form-control" required min="1" defaultValue={estimatedRent} />
              <button type="button" onClick={handleEstimateRent} disabled={isEstimating} className="btn" style={{ background: 'linear-gradient(to right, #8B5CF6, #6366F1)', color: 'white', whiteSpace: 'nowrap', fontWeight: 'bold' }}>
                {isEstimating ? 'Estimating...' : '✨ Estimate Rent with AI'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Image URL</label>
            <input type="url" name="image_url" className="form-control" placeholder="https://..." />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setIsListingModalOpen(false)} style={{marginRight: '0.5rem'}}>Cancel</button>
            <button type="submit" className="btn btn-primary">Publish Listing</button>
          </div>
        </form>
      </div>
    </div>
  );
}
