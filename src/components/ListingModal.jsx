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
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDescription, setGeneratedDescription] = useState('');

  // Controlled field state for the AI validation check
  const [titleVal, setTitleVal] = useState('');
  const [locationVal, setLocationVal] = useState('');
  const [propertyType, setPropertyType] = useState('Apartment');

  if (!isListingModalOpen) return null;

  // Button is only active when the three required fields are filled
  const canGenerate = titleVal.trim().length > 0 && locationVal.trim().length > 0;

  const handleGenerateDescription = async () => {
    if (!canGenerate) return;

    setIsGenerating(true);
    showToast('✨ AI is writing your description...', 'success');

    try {
      const aiApiUrl = import.meta.env.VITE_AI_API_URL || '/api/ai';
      const response = await fetch(`${aiApiUrl}/describe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: titleVal,
          location: locationVal,
          property_type: propertyType,
          amenities: selectedAmenities
        })
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedDescription(data.description);
        showToast('Description generated!', 'success');
      } else if (response.status === 429) {
        showToast('AI quota exceeded. Please try again later.', 'error');
      } else {
        showToast('AI description failed. Try again.', 'error');
      }
    } catch {
      showToast('AI Service is unavailable.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    setIsListingModalOpen(false);
    setTitleVal('');
    setLocationVal('');
    setPropertyType('Apartment');
    setGeneratedDescription('');
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content large" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>List a New Property</h2></div>
        <form onSubmit={handleAddProperty}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Property Type</label>
              <select
                name="property_type"
                className="form-control"
                required
                value={propertyType}
                onChange={e => setPropertyType(e.target.value)}
              >
                <option value="Apartment">Apartment</option>
                <option value="House">House</option>
                <option value="Villa">Villa</option>
                <option value="Studio">Studio</option>
              </select>
            </div>
            <div className="form-group" style={{ flex: 2 }}>
              <label>Title</label>
              <input
                type="text"
                name="title"
                className="form-control"
                required
                placeholder="Cozy Downtown Unit"
                value={titleVal}
                onChange={e => setTitleVal(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              className="form-control"
              required
              placeholder="City, State"
              value={locationVal}
              onChange={e => setLocationVal(e.target.value)}
            />
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ margin: 0 }}>Description</label>
              <button
                type="button"
                onClick={handleGenerateDescription}
                disabled={!canGenerate || isGenerating}
                title={!canGenerate ? 'Fill in Title and Location first to use AI' : 'Generate a description with AI'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.35rem 0.85rem',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  border: 'none',
                  borderRadius: '999px',
                  cursor: canGenerate && !isGenerating ? 'pointer' : 'not-allowed',
                  background: canGenerate
                    ? 'linear-gradient(to right, #8B5CF6, #6366F1)'
                    : '#E5E7EB',
                  color: canGenerate ? 'white' : '#9CA3AF',
                  transition: 'all 0.2s'
                }}
              >
                {isGenerating ? '⏳ Writing...' : '✨ Write with AI'}
              </button>
            </div>
            <textarea
              name="description"
              className="form-control"
              required
              rows="5"
              placeholder={
                canGenerate
                  ? 'Click "✨ Write with AI" above to auto-generate, or write manually...'
                  : 'Fill in Title and Location above to enable AI description generation...'
              }
              value={generatedDescription}
              onChange={e => setGeneratedDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Monthly Rent ($)</label>
            <input type="number" name="rent_amount" className="form-control" required min="1" />
          </div>

          <div className="form-group">
            <label>Image URL</label>
            <input type="url" name="image_url" className="form-control" placeholder="https://..." />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={handleClose} style={{ marginRight: '0.5rem' }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">Publish Listing</button>
          </div>
        </form>
      </div>
    </div>
  );
}
