import { useEffect, useState } from 'react'
import Pagination, { usePagination } from '../components/Pagination'
import UserForm from '../components/UserForm'
import { MessageContainer, useMessages } from '../components/ErrorMessage'
import { usersApi, PaginationParams } from '../lib/apiClient'

type User = {
  id: string
  email?: string | null
  username?: string | null
  full_name?: string | null
  avatar_url?: string | null
  phone?: string | null
  is_online?: boolean
  last_seen?: string | null
  created_at?: string | null
  updated_at?: string | null
}

type NewUser = {
  email: string
  password: string
  full_name: string
  username: string
  phone?: string
}

export default function Admin() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [showUserForm, setShowUserForm] = useState(false)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const { messages, addMessage, removeMessage, clearAllMessages } = useMessages()
  
  // Pagination hook
  const pagination = usePagination(10)
  
  // Pagination state from API
  const [totalUsers, setTotalUsers] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline'>('all')
  const [sortBy, setSortBy] = useState<'created_at' | 'full_name' | 'username'>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => { 
    fetchUsers() 
  }, [pagination.currentPage, pagination.pageSize, searchQuery, filterStatus, sortBy, sortOrder])

  async function fetchUsers() {
    try {
      setLoading(true)
      
      const params: PaginationParams = {
        page: pagination.currentPage,
        limit: pagination.pageSize,
        search: searchQuery || undefined,
        status: filterStatus,
        sortBy,
        sortOrder
      }

      const response = await usersApi.getUsers(params)
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch users')
      }

      setUsers(response.data)
      setTotalUsers(response.pagination.totalUsers)
      setTotalPages(response.pagination.totalPages)
    } catch (error) {
      addMessage({
        type: 'error',
        message: 'Failed to fetch users',
        duration: 5000
      })
      console.error('Fetch users error:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setFilterStatus('all')
    setSortBy('created_at')
    setSortOrder('desc')
    pagination.handlePageChange(1)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    pagination.handlePageChange(1)
    fetchUsers()
  }

  const openUserForm = (userId?: string) => {
    setEditingUserId(userId || null)
    setShowUserForm(true)
  }

  const closeUserForm = () => {
    setShowUserForm(false)
    setEditingUserId(null)
  }

  const handleUserSubmit = async (data: any) => {
    try {
      if (editingUserId) {
        // Update existing user
        const response = await usersApi.updateUser(editingUserId, {
          full_name: data.full_name,
          username: data.username,
          phone: data.phone
        })

        if (!response.success) {
          throw new Error(response.error || 'Failed to update user')
        }
      } else {
        // Create new user
        const response = await usersApi.createUser({
          email: data.email,
          password: data.password,
          full_name: data.full_name,
          username: data.username,
          phone: data.phone
        })

        if (!response.success) {
          throw new Error(response.error || 'Failed to create user')
        }
      }

      closeUserForm()
      fetchUsers()
    } catch (error) {
      throw error // Re-throw to let UserForm handle the error display
    }
  }

  async function deleteUser(id: string) {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const response = await usersApi.deleteUser(id)
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete user')
      }

      addMessage({
        type: 'success',
        message: 'User deleted successfully',
        duration: 3000
      })
      fetchUsers()
    } catch (error) {
      addMessage({
        type: 'error',
        message: 'Failed to delete user',
        duration: 5000
      })
      console.error('Delete user error:', error)
    }
  }

  const renderPagination = () => {
    const pages = []
    
    // Show max 5 pages
    let startPage = Math.max(1, pagination.currentPage - 2)
    let endPage = Math.min(totalPages, startPage + 4)
    
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
        <div className="flex items-center justify-between flex-1">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{(pagination.currentPage - 1) * pagination.pageSize + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(pagination.currentPage * pagination.pageSize, totalUsers)}
              </span>{' '}
              of <span className="font-medium">{totalUsers}</span> results
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={pagination.pageSize}
              onChange={(e) => pagination.handlePageSizeChange(Number(e.target.value))}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
            
            <div className="flex space-x-1">
              <button
                onClick={() => pagination.handlePageChange(1)}
                disabled={pagination.currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                First
              </button>
              <button
                onClick={() => pagination.handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {pages.map(page => (
                <button
                  key={page}
                  onClick={() => pagination.handlePageChange(page)}
                  className={`px-3 py-1 text-sm border rounded ${
                    page === pagination.currentPage
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => pagination.handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
              <button
                onClick={() => pagination.handlePageChange(totalPages)}
                disabled={pagination.currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Last
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Global Message Container */}
      <MessageContainer 
        messages={messages} 
        onClose={removeMessage}
        position="top-right"
      />
      
      <div className="max-w-6xl bg-white rounded shadow">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Admin — Users Management</h2>
            <button
              onClick={() => openUserForm()}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Create User
            </button>
          </div>
          
          {/* Search and Filters */}
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by name, username, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="created_at">Created Date</option>
                  <option value="full_name">Full Name</option>
                  <option value="username">Username</option>
                </select>
                
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
                
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Search
                </button>
                
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                >
                  Clear
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="text-left border-b border-gray-200">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <img
                        src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || 'User')}&background=3B82F6&color=fff`}
                        alt={user.full_name || ''}
                        className="w-8 h-8 rounded-full mr-3"
                      />
                      <div>
                        <div className="font-medium">{user.full_name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{user.email || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">{user.username || 'N/A'}</td>
                  <td className="py-3 px-4">{user.phone || 'N/A'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.is_online 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.is_online ? 'Online' : 'Offline'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openUserForm(user.id)}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}
          {!loading && users.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No users found
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && renderPagination()}
      </div>

      {/* User Form Modal */}
      {showUserForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <UserForm
            initialData={editingUserId ? {
    email: users.find(u => u.id === editingUserId)?.email || undefined,
    full_name: users.find(u => u.id === editingUserId)?.full_name || undefined,
    username: users.find(u => u.id === editingUserId)?.username || undefined,
    phone: users.find(u => u.id === editingUserId)?.phone || undefined,
    password: ''
  } : undefined}
            onSubmit={handleUserSubmit}
            onCancel={closeUserForm}
            isEdit={!!editingUserId}
            loading={loading}
          />
        </div>
      )}
    </div>
  )
}
