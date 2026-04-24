export default function PaymentModal({ isPaymentModalOpen, setIsPaymentModalOpen, pendingBooking, handlePaymentSubmit }) {
  if (!isPaymentModalOpen || !pendingBooking) return null;

  return (
    <div className="modal-overlay" onClick={() => setIsPaymentModalOpen(false)}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Secure Payment</h2>
          <p>Complete your booking for ${pendingBooking.total_rent_due}</p>
        </div>
        <form onSubmit={handlePaymentSubmit}>
          <div className="credit-card-mock">
            <div className="form-group">
              <label>Card Number</label>
              <input type="text" className="form-control" placeholder="0000 0000 0000 0000" required pattern="\d{16}" title="16 digit card number" />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Expiry</label>
                <input type="text" className="form-control" placeholder="MM/YY" required />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>CVC</label>
                <input type="text" className="form-control" placeholder="123" required pattern="\d{3,4}" />
              </div>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setIsPaymentModalOpen(false)} style={{marginRight: '0.5rem'}}>Cancel</button>
            <button type="submit" className="btn btn-pay" style={{padding: '0.75rem 1.5rem'}}>Pay ${pendingBooking.total_rent_due}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
