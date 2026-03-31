import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";

// Import admin services
import * as userService from "../../services/adminUserService";
import * as refundService from "../../services/adminRefundService";
import * as placeService from "../../services/adminPlaceService";
import * as paymentService from "../../services/adminPaymentService";

import "../../styles/admin.css";

function AdminDashboard() {
  const { token, role, region, userId, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [places, setPlaces] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form states
  const [editingUser, setEditingUser] = useState(null);
  const [newPlace, setNewPlace] = useState({
    name: "",
    state: "",
    city: "",
    description: "",
    adultPrice: "",
    childPrice: "",
    availableSlots: "",
    openingTime: "",
    closingTime: "",
    region: region || "NORTH",
  });
  const [editingPlace, setEditingPlace] = useState(null);
  const [editingPayment, setEditingPayment] = useState(null);
  const [showAddPlaceForm, setShowAddPlaceForm] = useState(false);
  const [refundFilter, setRefundFilter] = useState("ALL");

  // Check authentication
  useEffect(() => {
    if (!token || !role) {
      navigate("/login");
    }
  }, [token, role, navigate]);

  // Load data based on tab
  useEffect(() => {
    if (!token) return;

    switch (activeTab) {
      case "users":
        if (role === "REGIONAL_ADMIN") {
          loadUsers();
        }
        break;
      case "refunds":
        loadRefunds();
        break;
      case "places":
        loadPlaces();
        break;
      case "payments":
        if (role === "SUPER_ADMIN" || role === "REGIONAL_ADMIN") {
          loadPayments();
        }
        break;
      default:
        break;
    }
  }, [activeTab, token, role]);

  // ========== SUPER ADMIN: USERS MANAGEMENT ==========
  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.getAllUsers();
      setUsers(response.data);
    } catch (err) {
      setError("Failed to load users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await userService.deleteUser(userId);
      setUsers(users.filter((u) => u.userId !== userId));
      alert("User deleted successfully");
    } catch (err) {
      alert("Failed to delete user");
      console.error(err);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      const response = await userService.updateUser(editingUser.userId, editingUser);
      setUsers(users.map((u) => (u.userId === editingUser.userId ? response.data : u)));
      setEditingUser(null);
      alert("User updated successfully");
    } catch (err) {
      alert("Failed to update user");
      console.error(err);
    }
  };

  // ========== REFUNDS MANAGEMENT ==========
  const loadRefunds = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await refundService.getAllRefunds();
      setRefunds(response.data);
    } catch (err) {
      setError("Failed to load refunds");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRefund = async (refundId) => {
    try {
      const response = await refundService.approveRefund(refundId);
      setRefunds(refunds.map((r) => (r.refundId === refundId ? response.data : r)));
      alert("Refund approved successfully");
    } catch (err) {
      alert("Failed to approve refund");
      console.error(err);
    }
  };

  const handleRejectRefund = async (refundId) => {
    try {
      const response = await refundService.rejectRefund(refundId);
      setRefunds(refunds.map((r) => (r.refundId === refundId ? response.data : r)));
      alert("Refund rejected successfully");
    } catch (err) {
      alert("Failed to reject refund");
      console.error(err);
    }
  };

  const handleDeleteRefund = async (refundId) => {
    if (!window.confirm("Are you sure you want to delete this refund?")) return;

    try {
      await refundService.deleteRefund(refundId);
      setRefunds(refunds.filter((r) => r.refundId !== refundId));
      alert("Refund deleted successfully");
    } catch (err) {
      alert("Failed to delete refund");
      console.error(err);
    }
  };

  // ========== PLACES MANAGEMENT ==========
  const loadPlaces = async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (role === "SUPER_ADMIN") {
        response = await placeService.getAllPlaces();
      } else {
        // REGIONAL_ADMIN gets all places and filters by region
        response = await placeService.getAllPlaces();
        response.data = response.data.filter((p) => p.region === region);
      }
      setPlaces(response.data);
    } catch (err) {
      setError("Failed to load places");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlace = async () => {
    if (
      !newPlace.name ||
      !newPlace.state ||
      !newPlace.city ||
      !newPlace.adultPrice ||
      !newPlace.childPrice ||
      !newPlace.availableSlots ||
      !newPlace.openingTime ||
      !newPlace.closingTime
    ) {
      alert("Please fill all required fields (including opening and closing times)");
      return;
    }

    try {
      const placeData = {
        ...newPlace,
        adultPrice: parseFloat(newPlace.adultPrice),
        childPrice: parseFloat(newPlace.childPrice),
        availableSlots: parseInt(newPlace.availableSlots),
        region: newPlace.region || region || "NORTH",
      };

      const response = await placeService.createPlace(placeData);
      setPlaces([...places, response.data]);
      setNewPlace({
        name: "",
        state: "",
        city: "",
        description: "",
        adultPrice: "",
        childPrice: "",
        availableSlots: "",
        openingTime: "",
        closingTime: "",
        region: region || "NORTH",
      });
      setShowAddPlaceForm(false);
      alert("Place created successfully");
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to create place";
      alert(errorMsg);
      console.error("Error creating place:", err);
    }
  };

  const handleUpdatePlace = async () => {
    if (!editingPlace) return;

    try {
      const placeData = {
        ...editingPlace,
        adultPrice: parseFloat(editingPlace.adultPrice),
        childPrice: parseFloat(editingPlace.childPrice),
        availableSlots: parseInt(editingPlace.availableSlots),
      };

      const response = await placeService.updatePlace(editingPlace.placeId, placeData);
      setPlaces(places.map((p) => (p.placeId === editingPlace.placeId ? response.data : p)));
      setEditingPlace(null);
      alert("Place updated successfully");
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to update place";
      alert(errorMsg);
      console.error("Error updating place:", err);
    }
  };

  const handleDeletePlace = async (placeId) => {
    if (!window.confirm("Are you sure you want to delete this place?")) return;

    try {
      await placeService.deletePlace(placeId);
      setPlaces(places.filter((p) => p.placeId !== placeId));
      alert("Place deleted successfully");
    } catch (err) {
      alert("Failed to delete place");
      console.error(err);
    }
  };

  // ========== SUPER ADMIN: PAYMENTS MANAGEMENT ==========
  const loadPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await paymentService.getAllPayments();
      setPayments(response.data);
    } catch (err) {
      setError("Failed to load payments");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm("Are you sure you want to delete this payment?")) return;

    try {
      await paymentService.deletePayment(paymentId);
      setPayments(payments.filter((p) => p.paymentId !== paymentId));
      alert("Payment deleted successfully");
    } catch (err) {
      alert("Failed to delete payment");
      console.error(err);
    }
  };

  const handleUpdatePayment = async () => {
    if (!editingPayment) return;

    if (!editingPayment.amount || !editingPayment.transactionId || !editingPayment.paymentStatus) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const paymentData = {
        ...editingPayment,
        amount: parseFloat(editingPayment.amount),
      };

      const response = await paymentService.updatePayment(editingPayment.paymentId, paymentData);
      setPayments(payments.map((p) => (p.paymentId === editingPayment.paymentId ? response.data : p)));
      setEditingPayment(null);
      alert("Payment updated successfully");
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to update payment";
      alert(errorMsg);
      console.error("Error updating payment:", err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // ========== RENDER ==========
  return (
    <div className="admin-container">
      <Navbar />

      <div className="admin-main">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <div className="admin-sidebar-header">
            <div className="admin-avatar">{role === "SUPER_ADMIN" ? "👑" : "🔐"}</div>
            <div className="admin-user-info">
              <p className="admin-role">{role === "SUPER_ADMIN" ? "Super Admin" : "Regional Admin"}</p>
              {region && <p className="admin-region">{region}</p>}
            </div>
          </div>

          <nav className="admin-nav">
            <button
              className={"admin-nav-btn " + (activeTab === "overview" ? "active" : "")}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>

            {role === "REGIONAL_ADMIN" && (
              <button
                className={"admin-nav-btn " + (activeTab === "users" ? "active" : "")}
                onClick={() => setActiveTab("users")}
              >
                Manage Users
              </button>
            )}

            <button
              className={"admin-nav-btn " + (activeTab === "refunds" ? "active" : "")}
              onClick={() => setActiveTab("refunds")}
            >
              Manage Refunds
            </button>

            <button
              className={"admin-nav-btn " + (activeTab === "places" ? "active" : "")}
              onClick={() => setActiveTab("places")}
            >
              Manage Places
            </button>

            <button
              className={"admin-nav-btn " + (activeTab === "payments" ? "active" : "")}
              onClick={() => setActiveTab("payments")}
            >
              Manage Payments
            </button>
          </nav>

          
        </aside>

        {/* Main Content */}
        <main className="admin-content">
          {error && <div className="admin-error-banner">{error}</div>}
          {loading && <div className="admin-loading">Loading...</div>}

          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="admin-overview">
              <div className="admin-hero-banner">
                <div className="admin-hero-left">
                  <p className="admin-hero-greeting">Welcome, {role === "SUPER_ADMIN" ? "Super Admin" : "Regional Admin"}</p>
                  <h1 className="admin-hero-title">
                    {role === "SUPER_ADMIN" ? "Global Control Center" : "Regional Command Hub"}
                  </h1>
                  <p className="admin-hero-sub">
                    {role === "SUPER_ADMIN"
                      ? "Take fast action for all regions: refunds, places, payments."
                      : "Manage your region with confidence and precision in one place."}
                  </p>
                  <div className="admin-hero-region">
                    <span className="admin-region-chip-dot"></span>
                    <span className="admin-region-chip-text">Managing Region: {region || "ALL"}</span>
                  </div>
                </div>

                <div className="admin-hero-right">
                  <div className="admin-hero-stat">
                    <div className="admin-hero-stat-num"></div>
                    <div className="admin-hero-stat-lbl">Quick wins: Approve pending refunds</div>
                  </div>
                  <div className="admin-hero-stat">
                    <div className="admin-hero-stat-num"></div>
                    <div className="admin-hero-stat-lbl">Focus task: Add high-demand places</div>
                  </div>
                  <div className="admin-hero-stat">
                    <div className="admin-hero-stat-num"></div>
                    <div className="admin-hero-stat-lbl">Tip: Keep prices competitive in your region</div>
                  </div>
                </div>
              </div>

              <div className="admin-stats-grid">
                <div className="admin-stat-card" style={{ background: "#EFF6FF" }}>
                  <div className="stat-icon blue">🏆</div>
                  <div className="stat-info">
                    <h3>Goal</h3>
                    <p>Keep response time under 24h for refund reviews.</p>
                  </div>
                </div>
                <div className="admin-stat-card" style={{ background: "#ECFDF5" }}>
                  <div className="stat-icon green">🛠️</div>
                  <div className="stat-info">
                    <h3>Product Update</h3>
                    <p>New place fields available in next release: safety rating, accessibility.</p>
                  </div>
                </div>
                <div className="admin-stat-card" style={{ background: "#FEF7C3" }}>
                  <div className="stat-icon amber">🔍</div>
                  <div className="stat-info">
                    <h3>Actions</h3>
                    <p>Review refunds, sync payments, and approve place additions.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* USERS TAB - SUPER ADMIN ONLY */}
          {activeTab === "users" && (role === "SUPER_ADMIN" || role === "REGIONAL_ADMIN") && (
            <div className="admin-section">
              <h1>👥 Manage Users</h1>

              {editingUser && role === "SUPER_ADMIN" ? (
                <div className="admin-form-container">
                  <h2>Edit User</h2>
                  <div className="admin-form">
                    <div className="form-group">
                      <label>Name</label>
                      <input
                        type="text"
                        value={editingUser.name}
                        onChange={(e) =>
                          setEditingUser({ ...editingUser, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input type="email" value={editingUser.email} disabled />
                    </div>
                    <div className="form-group">
                      <label>Phone</label>
                      <input
                        type="text"
                        value={editingUser.phone}
                        onChange={(e) =>
                          setEditingUser({ ...editingUser, phone: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Role</label>
                      <select
                        value={editingUser.role}
                        onChange={(e) =>
                          setEditingUser({ ...editingUser, role: e.target.value })
                        }
                      >
                        <option value="USER">User</option>
                        <option value="REGIONAL_ADMIN">Regional Admin</option>
                        <option value="SUPER_ADMIN">Super Admin</option>
                      </select>
                    </div>
                  </div>
                  <div className="admin-form-actions">
                    <button className="btn-save" onClick={handleUpdateUser}>
                      Save Changes
                    </button>
                    <button className="btn-cancel" onClick={() => setEditingUser(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Role</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.userId}>
                          <td>{user.userId}</td>
                          <td>{user.name}</td>
                          <td>{user.email}</td>
                          <td>{user.phone}</td>
                          <td>
                            <span className={`badge badge-${user.role.toLowerCase()}`}>
                              {user.role}
                            </span>
                          </td>
                          <td>
                            {role === "SUPER_ADMIN" ? (
                              <>
                                <button
                                  className="btn-edit"
                                  onClick={() => setEditingUser({ ...user })}
                                >
                                  Edit
                                </button>
                                <button
                                  className="btn-delete"
                                  onClick={() => handleDeleteUser(user.userId)}
                                >
                                  Delete
                                </button>
                              </>
                            ) : (
                              <span>View only</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* REFUNDS TAB */}
          {activeTab === "refunds" && (
            <div className="admin-section">
              <h1>💰 Manage Refunds</h1>

              {/* Refund Status Summary */}
              <div className="admin-stats-row">
                <div className="admin-stat-card">
                  <h3>{refunds.length}</h3>
                  <p>Total Refunds</p>
                </div>
                <div className="admin-stat-card">
                  <h3>{refunds.filter((r) => r.refundStatus === "PENDING").length}</h3>
                  <p>Pending</p>
                </div>
                <div className="admin-stat-card">
                  <h3>{refunds.filter((r) => r.refundStatus === "APPROVED").length}</h3>
                  <p>Approved</p>
                </div>
                <div className="admin-stat-card">
                  <h3>{refunds.filter((r) => r.refundStatus === "REJECTED").length}</h3>
                  <p>Rejected</p>
                </div>
              </div>

              {/* Filter Buttons */}
              <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                  className={refundFilter === "ALL" ? "btn-filter-active" : "btn-filter"}
                  onClick={() => setRefundFilter("ALL")}
                >
                  All Refunds
                </button>
                <button
                  className={refundFilter === "PENDING" ? "btn-filter-active" : "btn-filter"}
                  onClick={() => setRefundFilter("PENDING")}
                >
                  ⏳ Pending
                </button>
                <button
                  className={refundFilter === "APPROVED" ? "btn-filter-active" : "btn-filter"}
                  onClick={() => setRefundFilter("APPROVED")}
                >
                  ✅ Approved
                </button>
                <button
                  className={refundFilter === "REJECTED" ? "btn-filter-active" : "btn-filter"}
                  onClick={() => setRefundFilter("REJECTED")}
                >
                  ❌ Rejected
                </button>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Refund ID</th>
                      <th>Ticket ID</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Requested At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(refundFilter === "ALL" ? refunds : refunds.filter((r) => r.refundStatus === refundFilter)).map(
                      (refund) => (
                        <tr key={refund.refundId}>
                          <td>{refund.refundId}</td>
                          <td>{refund.ticket?.ticketId || "N/A"}</td>
                          <td>₹{refund.refundAmount}</td>
                          <td>
                            <span
                              className={`badge badge-${refund.refundStatus.toLowerCase()}`}
                            >
                              {refund.refundStatus}
                            </span>
                          </td>
                          <td>{new Date(refund.requestedAt).toLocaleDateString()}</td>
                          <td>
                            {refund.refundStatus === "PENDING" && (
                              <>
                                <button
                                  className="btn-approve"
                                  onClick={() => handleApproveRefund(refund.refundId)}
                                >
                                  ✅ Approve
                                </button>
                                <button
                                  className="btn-reject"
                                  onClick={() => handleRejectRefund(refund.refundId)}
                                >
                                  ❌ Reject
                                </button>
                              </>
                            )}
                            {refund.refundStatus !== "PENDING" && role !== "SUPER_ADMIN" && (
                              <span>{refund.refundStatus === "APPROVED" ? "Approved" : "Rejected"}</span>
                            )}
                            {role === "SUPER_ADMIN" && (
                              <button
                                className="btn-delete"
                                onClick={() => handleDeleteRefund(refund.refundId)}
                              >
                                🗑️ Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PLACES TAB */}
          {activeTab === "places" && (
            <div className="admin-section">
              <h1>🏞️ Manage Places</h1>

              {editingPlace ? (
                <div className="admin-form-container">
                  <h2>Edit Place</h2>
                  <div className="admin-form">
                    <div className="form-group">
                      <label>Name</label>
                      <input
                        type="text"
                        value={editingPlace.name}
                        onChange={(e) =>
                          setEditingPlace({ ...editingPlace, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>State</label>
                        <input
                          type="text"
                          value={editingPlace.state}
                          onChange={(e) =>
                            setEditingPlace({ ...editingPlace, state: e.target.value })
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label>City</label>
                        <input
                          type="text"
                          value={editingPlace.city}
                          onChange={(e) =>
                            setEditingPlace({ ...editingPlace, city: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        value={editingPlace.description || ""}
                        onChange={(e) =>
                          setEditingPlace({ ...editingPlace, description: e.target.value })
                        }
                        rows="3"
                      ></textarea>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Adult Price (₹)</label>
                        <input
                          type="number"
                          value={editingPlace.adultPrice}
                          onChange={(e) =>
                            setEditingPlace({ ...editingPlace, adultPrice: e.target.value })
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label>Child Price (₹)</label>
                        <input
                          type="number"
                          value={editingPlace.childPrice}
                          onChange={(e) =>
                            setEditingPlace({ ...editingPlace, childPrice: e.target.value })
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label>Available Slots</label>
                        <input
                          type="number"
                          value={editingPlace.availableSlots}
                          onChange={(e) =>
                            setEditingPlace({ ...editingPlace, availableSlots: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Opening Time</label>
                        <input
                          type="time"
                          value={editingPlace.openingTime || ""}
                          onChange={(e) =>
                            setEditingPlace({ ...editingPlace, openingTime: e.target.value })
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label>Closing Time</label>
                        <input
                          type="time"
                          value={editingPlace.closingTime || ""}
                          onChange={(e) =>
                            setEditingPlace({ ...editingPlace, closingTime: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="admin-form-actions">
                    <button className="btn-save" onClick={handleUpdatePlace}>
                      Save Changes
                    </button>
                    <button className="btn-cancel" onClick={() => setEditingPlace(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : showAddPlaceForm ? (
                <div className="admin-form-container">
                  <h2>Add New Place</h2>
                  <div className="admin-form">
                    <div className="form-group">
                      <label>Name *</label>
                      <input
                        type="text"
                        placeholder="e.g., Taj Mahal"
                        value={newPlace.name}
                        onChange={(e) => setNewPlace({ ...newPlace, name: e.target.value })}
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>State *</label>
                        <input
                          type="text"
                          placeholder="e.g., Uttar Pradesh"
                          value={newPlace.state}
                          onChange={(e) =>
                            setNewPlace({ ...newPlace, state: e.target.value })
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label>City *</label>
                        <input
                          type="text"
                          placeholder="e.g., Agra"
                          value={newPlace.city}
                          onChange={(e) => setNewPlace({ ...newPlace, city: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        placeholder="Describe this place..."
                        value={newPlace.description}
                        onChange={(e) =>
                          setNewPlace({ ...newPlace, description: e.target.value })
                        }
                        rows="3"
                      ></textarea>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Adult Price (₹) *</label>
                        <input
                          type="number"
                          placeholder="Enter adult price"
                          value={newPlace.adultPrice}
                          onChange={(e) =>
                            setNewPlace({ ...newPlace, adultPrice: e.target.value })
                          }
                          autoComplete="off"
                        />
                      </div>
                      <div className="form-group">
                        <label>Child Price (₹) *</label>
                        <input
                          type="number"
                          placeholder="Enter child price"
                          value={newPlace.childPrice}
                          onChange={(e) =>
                            setNewPlace({ ...newPlace, childPrice: e.target.value })
                          }
                          autoComplete="off"
                        />
                      </div>
                      <div className="form-group">
                        <label>Available Slots *</label>
                        <input
                          type="number"
                          placeholder="Enter available slots"
                          value={newPlace.availableSlots}
                          onChange={(e) =>
                            setNewPlace({ ...newPlace, availableSlots: e.target.value })
                          }
                          autoComplete="off"
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Opening Time *</label>
                        <input
                          type="time"
                          value={newPlace.openingTime}
                          onChange={(e) =>
                            setNewPlace({ ...newPlace, openingTime: e.target.value })
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label>Closing Time *</label>
                        <input
                          type="time"
                          value={newPlace.closingTime}
                          onChange={(e) =>
                            setNewPlace({ ...newPlace, closingTime: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    {role === "SUPER_ADMIN" && (
                      <div className="form-group">
                        <label>Region</label>
                        <select
                          value={newPlace.region}
                          onChange={(e) =>
                            setNewPlace({ ...newPlace, region: e.target.value })
                          }
                        >
                          <option value="NORTH">North</option>
                          <option value="SOUTH">South</option>
                          <option value="EAST">East</option>
                          <option value="WEST">West</option>
                        </select>
                      </div>
                    )}
                  </div>
                  <div className="admin-form-actions">
                    <button className="btn-save" onClick={handleCreatePlace}>
                       Add Place
                    </button>
                    <button
                      className="btn-cancel"
                      onClick={() => {
                        setShowAddPlaceForm(false);
                        setNewPlace({
                          name: "",
                          state: "",
                          city: "",
                          description: "",
                          adultPrice: "",
                          childPrice: "",
                          availableSlots: "",
                          openingTime: "",
                          closingTime: "",
                          region: region || "NORTH",
                        });
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: "20px" }}>
                    <button
                      className="btn-save"
                      onClick={() => {
                        setShowAddPlaceForm(true);
                        setNewPlace({
                          name: "",
                          state: "",
                          city: "",
                          description: "",
                          adultPrice: "",
                          childPrice: "",
                          availableSlots: "",
                          openingTime: "",
                          closingTime: "",
                          region: region || "NORTH",
                        });
                      }}
                      style={{ padding: "10px 20px" }}
                    >
                      ➕ Add New Place
                    </button>
                  </div>

                  <div className="admin-table-container">
                    <h2>Places List {role === "REGIONAL_ADMIN" && `(${region})`}</h2>
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>City</th>
                          <th>State</th>
                          {role === "SUPER_ADMIN" && <th>Region</th>}
                          <th>Adult Price</th>
                          <th>Child Price</th>
                          <th>Available Slots</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {places.map((place) => (
                          <tr key={place.placeId}>
                            <td>{place.placeId}</td>
                            <td>{place.name}</td>
                            <td>{place.city}</td>
                            <td>{place.state}</td>
                            {role === "SUPER_ADMIN" && <td>{place.region}</td>}
                            <td>₹{place.adultPrice}</td>
                            <td>₹{place.childPrice}</td>
                            <td>{place.availableSlots}</td>
                            <td>
                              <button
                                className="btn-edit"
                                onClick={() => setEditingPlace({ ...place })}
                              >
                                ✏️ Edit
                              </button>
                              <button
                                className="btn-delete"
                                onClick={() => handleDeletePlace(place.placeId)}
                              >
                                🗑️ Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {/* PAYMENTS TAB - SUPER ADMIN ONLY */}
          {activeTab === "payments" && (role === "SUPER_ADMIN" || role === "REGIONAL_ADMIN") && (
            <div className="admin-section">
              <h1>💳 Manage Payments</h1>

              {editingPayment ? (
                <div className="admin-form-container">
                  <h2>Edit Payment</h2>
                  <div className="admin-form">
                    <div className="form-group">
                      <label>Payment ID</label>
                      <input
                        type="text"
                        value={editingPayment.paymentId}
                        disabled
                      />
                    </div>
                    <div className="form-group">
                      <label>Transaction ID</label>
                      <input
                        type="text"
                        value={editingPayment.transactionId}
                        onChange={(e) =>
                          setEditingPayment({ ...editingPayment, transactionId: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Amount (₹)</label>
                        <input
                          type="number"
                          value={editingPayment.amount}
                          onChange={(e) =>
                            setEditingPayment({ ...editingPayment, amount: e.target.value })
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label>Payment Status *</label>
                        <select
                          value={editingPayment.paymentStatus}
                          onChange={(e) =>
                            setEditingPayment({ ...editingPayment, paymentStatus: e.target.value })
                          }
                        >
                          <option value="PENDING">Pending</option>
                          <option value="SUCCESS">Success</option>
                          <option value="FAILED">Failed</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Payment Method</label>
                      <input
                        type="text"
                        value={editingPayment.paymentMethod || ""}
                        onChange={(e) =>
                          setEditingPayment({ ...editingPayment, paymentMethod: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="admin-form-actions">
                    <button className="btn-save" onClick={handleUpdatePayment}>
                      Save Changes
                    </button>
                    <button className="btn-cancel" onClick={() => setEditingPayment(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Payment ID</th>
                        <th>User ID</th>
                        <th>Amount</th>
                        <th>Transaction ID</th>
                        <th>Status</th>
                        <th>Payment Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment.paymentId}>
                          <td>{payment.paymentId}</td>
                          <td>{payment.user?.userId || "N/A"}</td>
                          <td>₹{payment.amount}</td>
                          <td>{payment.transactionId}</td>
                          <td>
                            <span
                              className={`badge badge-${payment.paymentStatus.toLowerCase()}`}
                            >
                              {payment.paymentStatus}
                            </span>
                          </td>
                          <td>
                            {payment.paymentDate
                              ? new Date(payment.paymentDate).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td>
                            <button
                              className="btn-edit"
                              onClick={() => setEditingPayment({ ...payment })}
                            >
                              ✏️ Edit
                            </button>
                            {role === "SUPER_ADMIN" && (
                              <button
                                className="btn-delete"
                                onClick={() => handleDeletePayment(payment.paymentId)}
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default AdminDashboard;





