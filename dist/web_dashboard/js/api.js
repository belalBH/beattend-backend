const API_BASE_URL = localStorage.getItem('apiUrl') || 'http://127.0.0.1:8080/api';

// API Helper Functions
const api = {
    // Generic API call function
    async call(endpoint, method = 'GET', data = null) {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Tenant-ID': localStorage.getItem('tenantId') || 'tenant-sol-102'
            }
        };

        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'حدث خطأ في الاتصال');
            }
            
            return result;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Companies
    async getCompanies() {
        return await this.call('/companies');
    },

    // Login
    async login(email, password) {
        return await this.call('/login', 'POST', { email, password });
    },

    // Employees
    async getEmployees(companyId = null) {
        let url = '/employees';
        if (companyId) url += `?companyId=${companyId}`;
        return await this.call(url);
    },

    async getEmployee(id) {
        return await this.call(`/employees/${id}`);
    },

    async addEmployee(employeeData) {
        return await this.call('/employees', 'POST', employeeData);
    },

    async updateEmployee(id, employeeData) {
        return await this.call(`/employees/${id}`, 'PUT', employeeData);
    },

    async enableAccount(id) {
        return await this.call(`/employees/${id}/enable-account`, 'POST');
    },

    async disableAccount(id) {
        return await this.call(`/employees/${id}/disable-account`, 'POST');
    },

    async resetPassword(id, password) {
        return await this.call(`/employees/${id}/reset-password`, 'POST', { password });
    },

    // Attendance
    async getTodayAttendance() {
        return await this.call('/attendance/today');
    },

    async getAttendanceRecords(employeeId, startDate, endDate) {
        let url = '/attendance/records';
        const params = new URLSearchParams();
        
        if (employeeId) params.append('employee_id', employeeId);
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        
        if (params.toString()) {
            url += '?' + params.toString();
        }
        
        return await this.call(url);
    },

    async getAttendanceSummary(employeeId, year, month) {
        return await this.call(`/attendance/summary?employee_id=${employeeId}&year=${year}&month=${month}`);
    },

    async clockIn(employeeId, latitude, longitude, deviceName, deviceId, platform) {
        return await this.call('/attendance/clock-in', 'POST', {
            employee_id: employeeId,
            latitude: latitude,
            longitude: longitude,
            device_name: deviceName,
            device_id: deviceId,
            platform: platform
        });
    },

    async clockOut(employeeId, latitude, longitude) {
        return await this.call('/attendance/clock-out', 'POST', {
            employee_id: employeeId,
            latitude: latitude,
            longitude: longitude
        });
    },

    // Leave Requests
    async getLeaveRequests(employeeId = null, status = null) {
        let url = '/leaves/requests';
        const params = new URLSearchParams();
        
        if (employeeId) params.append('employeeId', employeeId);
        if (status) params.append('status', status);
        
        if (params.toString()) {
            url += '?' + params.toString();
        }
        
        return await this.call(url);
    },

    async getLeaveBalance(employeeId, year) {
        return await this.call(`/leaves/balances?employeeId=${employeeId}`);
    },

    async submitLeaveRequest(leaveData) {
        return await this.call('/leaves/requests', 'POST', leaveData);
    },

    async approveLeaveRequest(requestId) {
        return await this.call(`/leaves/requests/${requestId}/hr-action`, 'POST', { decision: 'approve' });
    },

    async rejectLeaveRequest(requestId, reason) {
        return await this.call(`/leaves/requests/${requestId}/hr-action`, 'POST', { decision: 'reject', comment: reason });
    },

    // Work Locations
    async getWorkLocations() {
        return await this.call('/locations');
    },

    async addWorkLocation(locationData) {
        return await this.call('/locations', 'POST', locationData);
    },

    async updateWorkLocation(id, locationData) {
        return await this.call(`/location/${id}`, 'PUT', locationData);
    },

    async deleteWorkLocation(id) {
        return await this.call(`/location/${id}`, 'DELETE');
    },

    // Dashboard Stats
    async getDashboardStats() {
        return await this.call('/dashboard/stats');
    },

    // Reports
    async getMonthlyReport(year, month) {
        return await this.call(`/reports/monthly?year=${year}&month=${month}`);
    },

    async getLeaveReport(year) {
        return await this.call(`/reports/leaves?year=${year}`);
    },

    async getLateReport(startDate, endDate) {
        return await this.call(`/reports/late?start_date=${startDate}&end_date=${endDate}`);
    }
};

// Utility Functions
function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
    alertDiv.style.zIndex = '9999';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA');
}

function formatTime(timeString) {
    if (!timeString) return '-';
    const date = new Date(timeString);
    return date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
}

function formatDuration(hours) {
    if (!hours) return '-';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}س ${m}د`;
}

function getStatusBadge(status) {
    const statusMap = {
        'present': { class: 'status-present', text: 'حاضر' },
        'absent': { class: 'status-absent', text: 'غائب' },
        'late': { class: 'status-late', text: 'متأخر' },
        'pending': { class: 'status-pending', text: 'قيد المراجعة' },
        'approved': { class: 'status-approved', text: 'موافق' },
        'rejected': { class: 'status-rejected', text: 'مرفوض' }
    };
    
    const statusInfo = statusMap[status] || { class: '', text: status };
    return `<span class="${statusInfo.class}">${statusInfo.text}</span>`;
}

function showLoading(elementId) {
    document.getElementById(elementId).innerHTML = `
        <tr>
            <td colspan="10" class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">جاري التحميل...</span>
                </div>
            </td>
        </tr>
    `;
}

function showError(elementId, message) {
    document.getElementById(elementId).innerHTML = `
        <tr>
            <td colspan="10" class="text-center text-danger">
                <i class="bi bi-exclamation-circle"></i> ${message}
            </td>
        </tr>
    `;
}
