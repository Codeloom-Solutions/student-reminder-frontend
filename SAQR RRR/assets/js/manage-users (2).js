const users = JSON.parse(localStorage.getItem('saqr_users')) || [];
const userTableBody = document.getElementById('admin-user-table-body');

users.forEach(user => {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${user.fullName}</td>
        <td>${user.email}</td>
        <td>${user.role}</td>
        <td>${user.status}</td>
        <td>
            <button onclick="approveUser(${user.id})">Approve</button>
        </td>
    `;
    userTableBody.appendChild(row);
});