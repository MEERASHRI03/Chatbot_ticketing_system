import React, { useState, useEffect } from 'react';
import refundService from '../services/refundService';
import { formatCurrency, REFUND_STATUS } from '../utils/constants';
import './ManageRefunds.css';

const ManageRefunds = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const response = await refundService.getAllRefunds();
      setRefunds(response.data || []);
    } catch (err) {
      console.error('Failed to load refunds:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (refundId) => {
    if (window.confirm('Approve this refund?')) {
      try {
        await refundService.approveRefund(refundId);
        fetchRefunds();
      } catch (err) {
        console.error('Failed to approve refund:', err);
      }
    }
  };

  const handleReject = async (refundId) => {
    if (window.confirm('Reject this refund?')) {
      try {
        await refundService.rejectRefund(refundId);
        fetchRefunds();
      } catch (err) {
        console.error('Failed to reject refund:', err);
      }
    }
  };

  const filteredRefunds = filterStatus === 'ALL' 
    ? refunds 
    : refunds.filter(r => r.refundStatus === filterStatus);

  if (loading) {
    return <div className="container mt-5"><p>Loading...</p></div>;
  }

  return (
    <div className="manage-refunds">
      <div className="container">
        <h1>Manage Refunds</h1>

        <div className="filter-tabs">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(status => (
            <button
              key={status}
              className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
              onClick={() => setFilterStatus(status)}
            >
              {status}
            </button>
          ))}
        </div>

        {filteredRefunds.length > 0 ? (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Refund ID</th>
                  <th>Ticket</th>
                  <th>Amount</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Requested At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRefunds.map(refund => (
                  <tr key={refund.refundId}>
                    <td>#{refund.refundId}</td>
                    <td>{refund.ticket?.ticketNumber}</td>
                    <td>{formatCurrency(refund.refundAmount)}</td>
                    <td>{refund.reason}</td>
                    <td>
                      <span className={`badge status-${refund.refundStatus.toLowerCase()}`}>
                        {refund.refundStatus}
                      </span>
                    </td>
                    <td>{new Date(refund.requestedAt).toLocaleDateString()}</td>
                    <td>
                      {refund.refundStatus === 'PENDING' && (
                        <>
                          <button 
                            onClick={() => handleApprove(refund.refundId)}
                            className="btn btn-sm btn-success"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleReject(refund.refundId)}
                            className="btn btn-sm btn-danger"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No refunds found.</p>
        )}
      </div>
    </div>
  );
};

export default ManageRefunds;
