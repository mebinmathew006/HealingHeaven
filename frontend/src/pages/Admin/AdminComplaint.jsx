import React, { useState, useEffect } from 'react';
import { Edit2, Save, X, Filter, Search } from 'lucide-react';

const AdminComplaint = () => {
  const [complaints, setComplaints] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingStatus, setEditingStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockComplaints = [
      {
        id: 1,
        consultation_id: 101,
        type: 'Service Issue',
        subject: 'Long wait time',
        description: 'Had to wait for 2 hours for my appointment',
        status: 'Open'
      },
      {
        id: 2,
        consultation_id: 102,
        type: 'Billing',
        subject: 'Incorrect charges',
        description: 'Charged twice for the same consultation',
        status: 'In Progress'
      },
      {
        id: 3,
        consultation_id: 103,
        type: 'Staff Behavior',
        subject: 'Rude reception staff',
        description: 'Reception staff was unprofessional and rude',
        status: 'Resolved'
      },
      {
        id: 4,
        consultation_id: 104,
        type: 'Technical',
        subject: 'System error',
        description: 'Online booking system crashed during payment',
        status: 'Open'
      },
      {
        id: 5,
        consultation_id: 105,
        type: 'Service Issue',
        subject: 'Appointment cancellation',
        description: 'Appointment was cancelled without prior notice',
        status: 'Closed'
      }
    ];
    
    setTimeout(() => {
      setComplaints(mockComplaints);
      setLoading(false);
    }, 500);
  }, []);

  const statusOptions = ['Open', 'In Progress', 'Resolved', 'Closed', 'Rejected'];
  
  const getStatusColor = (status) => {
    const colors = {
      'Open': 'bg-red-100 text-red-800',
      'In Progress': 'bg-yellow-100 text-yellow-800',
      'Resolved': 'bg-green-100 text-green-800',
      'Closed': 'bg-gray-100 text-gray-800',
      'Rejected': 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleEdit = (complaint) => {
    setEditingId(complaint.id);
    setEditingStatus(complaint.status);
  };

  const handleSave = async (id) => {
    try {
      // Here you would make an API call to update the complaint status
      // const response = await fetch(`/api/complaints/${id}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ status: editingStatus })
      // });
      
      setComplaints(prev => 
        prev.map(complaint => 
          complaint.id === id 
            ? { ...complaint, status: editingStatus }
            : complaint
        )
      );
      
      setEditingId(null);
      setEditingStatus('');
    } catch (error) {
      console.error('Error updating complaint status:', error);
      alert('Failed to update complaint status');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingStatus('');
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading complaints...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complaint Management</h1>
          <p className="text-gray-600">Manage and update complaint statuses</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search complaints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          {statusOptions.map(status => {
            const count = complaints.filter(c => c.status === status).length;
            return (
              <div key={status} className="bg-white rounded-lg shadow p-4">
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className="text-sm text-gray-600">{status}</div>
              </div>
            );
          })}
        </div>

        {/* Complaints Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Consultation ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredComplaints.map((complaint) => (
                  <tr key={complaint.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{complaint.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {complaint.consultation_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {complaint.type}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {complaint.subject}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-sm truncate">
                      {complaint.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === complaint.id ? (
                        <select
                          value={editingStatus}
                          onChange={(e) => setEditingStatus(e.target.value)}
                          className="text-sm px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {statusOptions.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      ) : (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(complaint.status)}`}>
                          {complaint.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingId === complaint.id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSave(complaint.id)}
                            className="text-green-600 hover:text-green-800 transition-colors"
                            title="Save"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancel}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEdit(complaint)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Edit Status"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredComplaints.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">No complaints found matching your criteria</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          Showing {filteredComplaints.length} of {complaints.length} complaints
        </div>
      </div>
    </div>
  );
};

export default AdminComplaint;