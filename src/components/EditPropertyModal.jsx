import { useState, useEffect } from 'react';

const AMENITY_OPTIONS = [
  { id: 'wifi', label: '📶 Fast WiFi' },
  { id: 'pool', label: '🏊 Pool' },
  { id: 'gym', label: '🏋️ Gym' },
  { id: 'parking', label: '🚗 Parking' },
  { id: 'ac', label: '❄️ AC' },
  { id: 'pets', label: '🐾 Pets Allowed' }
];

export default function EditPropertyModal({ property, isOpen, onClose, onSave }) {
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  useEffect(() => {
    if (property) {
      setSelectedAmenities(property.amenities || []);
    }
  }, [property]);

  if (!isOpen || !property) return null;

  const toggleAmenity = (label) => {
    setSelectedAmenities(prev =>
      prev.includes(label) ? prev.filter(a => a !== label) : [...prev, label]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updates = {
      title: e.target.title.value,
      description: e.target.description.value,
      location: e.target.location.value,
      rent_amount: parseFloat(e.target.rent_amount.value),
      amenities: selectedAmenities,
      images: [e.target.image_url.value || property.images[0]],
      is_available: e.target.is_available.value === 'true',
    };
    await onSave(property.id, updates);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>Edit Property Listing</h2></div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input type="text" name="title" className="form-control" defaultValue={property.title} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" className="form-control" rows="3" defaultValue={property.description} required />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Location</label>
              <input type="text" name="location" className="form-control" defaultValue={property.location} required />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Monthly Rent ($)</label>
              <input type="number" name="rent_amount" className="form-control" defaultValue={property.rent_amount} required min="1" />
            </div>
          </div>
          <div className="form-group">
            <label>Availability Status</label>
            <select name="is_available" className="form-control" defaultValue={String(property.is_available)}>
              <option value="true">✅ Available</option>
              <option value="false">🔒 Not Available</option>
            </select>
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
            <label>Image URL</label>
            <input type="url" name="image_url" className="form-control" defaultValue={property.images?.[0] || ''} />
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
