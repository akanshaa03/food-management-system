import React, { useState, useEffect } from 'react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Table } from '../../components/common/Table';
import { StatusBadge } from '../../components/common/StatusBadge';
import { CsvUploadModal } from '../../components/common/CsvUploadModal';
import { BarcodeScannerModal } from '../../components/common/BarcodeScannerModal';
import { inventoryService } from '../../services/inventoryService';
import { donationService } from '../../services/donationService';
import {
  Plus,
  Upload,
  QrCode,
  Search,
  Filter,
  ArrowUpDown,
  Edit2,
  Trash2,
  History,
  CheckCircle2,
  HeartHandshake,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

export const BusinessInventoryPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Search, Filter & Pagination Controls
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('expiry_date');
  const [sortOrder, setSortOrder] = useState('ASC');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limitPerPage = 10;

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  // Active Item for Editing or Publishing
  const [activeItem, setActiveItem] = useState(null);

  // Forms
  const [addForm, setAddForm] = useState({
    productName: '',
    categoryName: 'Bakery & Bread',
    quantity: '',
    unit: 'kg',
    purchaseDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    supplierName: '',
    storageCondition: 'Ambient',
    batchNumber: '',
  });

  const [editForm, setEditForm] = useState({
    productName: '',
    categoryName: 'Bakery & Bread',
    quantity: '',
    unit: 'kg',
    expiryDate: '',
    storageCondition: 'Ambient',
    status: 'AVAILABLE',
  });

  const [publishForm, setPublishForm] = useState({
    title: '',
    category: 'Bakery & Bread',
    quantity: '',
    unit: 'kg',
    foodImageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500',
    pickupTime: '',
    expiryDate: '',
    pickupAddress: 'Loading Dock B, Business HQ',
    notes: '',
  });

  const fetchInventory = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await inventoryService.getMyItems({
        search: searchTerm,
        category: selectedCategory,
        status: selectedStatus,
        sortBy,
        sortOrder,
        page: currentPage,
        limit: limitPerPage,
      });
      if (res && res.success && res.data) {
        setItems(res.data);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages || 1);
          setTotalCount(res.pagination.total || res.data.length);
        }
      }
    } catch (err) {
      console.error('PostgreSQL Inventory fetch error:', err);
      setErrorMsg('Failed to load inventory products from PostgreSQL.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [searchTerm, selectedCategory, selectedStatus, sortBy, sortOrder, currentPage]);

  const triggerSuccess = (msg) => {
    setFeedbackMsg(msg);
    fetchInventory();
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  // Add Product Handler
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await inventoryService.createManual(addForm);
      setIsAddModalOpen(false);
      triggerSuccess(`Product "${addForm.productName}" saved directly to PostgreSQL!`);
    } catch (err) {
      setErrorMsg(`Failed to save product "${addForm.productName}": ${err?.message || 'Server error'}`);
    }
  };

  // Open Edit Modal
  const openEditModal = (item) => {
    setActiveItem(item);
    setEditForm({
      productName: item.product_name,
      categoryName: item.category_name || 'General',
      quantity: item.quantity,
      unit: item.unit || 'kg',
      expiryDate: item.expiry_date?.split('T')[0] || '',
      storageCondition: item.storage_condition || 'Ambient',
      status: item.status || 'AVAILABLE',
    });
    setIsEditModalOpen(true);
  };

  // Submit Edit Product Handler
  const handleEditProduct = async (e) => {
    e.preventDefault();
    try {
      await inventoryService.updateItem(activeItem.id, editForm);
      setIsEditModalOpen(false);
      triggerSuccess(`Product "${editForm.productName}" updated in PostgreSQL!`);
    } catch (err) {
      setErrorMsg(`Failed to update product "${editForm.productName}": ${err?.message || 'Server error'}`);
    }
  };

  // Delete Product Handler
  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from PostgreSQL inventory?`)) return;
    try {
      await inventoryService.deleteItem(id);
      triggerSuccess(`Deleted product "${name}" from PostgreSQL.`);
    } catch (err) {
      setErrorMsg(`Failed to delete product "${name}": ${err?.message || 'Server error'}`);
    }
  };

  // Open Publish Donation Modal
  const openPublishModal = (item) => {
    setActiveItem(item);
    setPublishForm({
      title: item.product_name,
      category: item.category_name || 'General',
      quantity: item.quantity,
      unit: item.unit || 'kg',
      foodImageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500',
      pickupTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
      expiryDate: item.expiry_date?.slice(0, 16) || new Date(Date.now() + 172800000).toISOString().slice(0, 16),
      pickupAddress: 'Loading Dock B, Business Headquarters',
      notes: 'Fresh excess inventory ready for NGO pickup',
    });
    setIsPublishModalOpen(true);
  };

  const handlePublishDonation = async (e) => {
    e.preventDefault();
    try {
      await donationService.publishDonation({
        inventoryId: activeItem?.id,
        ...publishForm,
      });
      setIsPublishModalOpen(false);
      triggerSuccess(`Surplus Donation "${publishForm.title}" Published in PostgreSQL! (Status: AVAILABLE)`);
    } catch (err) {
      setErrorMsg(`Failed to publish donation "${publishForm.title}": ${err?.message || 'Server error'}`);
    }
  };

  const columns = [
    { header: 'Product Name', accessorKey: 'product_name' },
    { header: 'Category', accessorKey: 'category_name' },
    { header: 'Quantity', render: (r) => `${r.quantity} ${r.unit}` },
    { header: 'Expiry Date', render: (r) => r.expiry_date?.split('T')[0] || r.expiry_date },
    { header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      header: 'Actions',
      render: (r) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => openPublishModal(r)}
            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors flex items-center text-xs font-semibold"
            title="Publish as Surplus Donation"
          >
            <HeartHandshake className="h-4 w-4 mr-1" /> Donate
          </button>
          <button
            onClick={() => openEditModal(r)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit Product"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteProduct(r.id, r.product_name)}
            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete Product"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management & Donation Publishing</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage stock & publish surplus food directly to NGOs</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="secondary" onClick={() => setIsBarcodeModalOpen(true)}>
            <QrCode className="mr-2 h-4 w-4" /> Scan Code
          </Button>
          <Button variant="secondary" onClick={() => setIsCsvModalOpen(true)}>
            <Upload className="mr-2 h-4 w-4" /> CSV Upload
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center text-emerald-800 text-sm font-semibold">
          <CheckCircle2 className="h-5 w-5 mr-2 text-emerald-600" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center text-red-800 text-sm font-semibold">
          <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Live Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products, batches..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="ALL">All Categories</option>
            <option value="Bakery & Bread">Bakery & Bread</option>
            <option value="Dairy & Eggs">Dairy & Eggs</option>
            <option value="Fresh Produce">Fresh Produce</option>
            <option value="Meat & Seafood">Meat & Seafood</option>
            <option value="Prepared Meals">Prepared Meals</option>
            <option value="Pantry & Packaged">Pantry & Packaged</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="EXPIRING_SOON">Expiring Soon</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <Table columns={columns} data={items} />

        {/* Pagination Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-xs text-gray-600">
          <span>Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalCount} total items in PostgreSQL)</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-40 flex items-center"
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="px-3 py-1.5 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-40 flex items-center"
            >
              Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Product to Inventory">
        <form className="space-y-4" onSubmit={handleAddProduct}>
          <Input
            label="Product Name"
            required
            value={addForm.productName}
            onChange={(e) => setAddForm({ ...addForm, productName: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Quantity"
              type="number"
              required
              value={addForm.quantity}
              onChange={(e) => setAddForm({ ...addForm, quantity: e.target.value })}
            />
            <Input
              label="Expiry Date"
              type="date"
              required
              value={addForm.expiryDate}
              onChange={(e) => setAddForm({ ...addForm, expiryDate: e.target.value })}
            />
          </div>
          <Button type="submit" className="w-full">Save Product</Button>
        </form>
      </Modal>

      {/* Edit Product Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Product: ${activeItem?.product_name || ''}`}>
        <form className="space-y-4" onSubmit={handleEditProduct}>
          <Input
            label="Product Name"
            required
            value={editForm.productName}
            onChange={(e) => setEditForm({ ...editForm, productName: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Quantity"
              type="number"
              required
              value={editForm.quantity}
              onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
            />
            <Input
              label="Expiry Date"
              type="date"
              required
              value={editForm.expiryDate}
              onChange={(e) => setEditForm({ ...editForm, expiryDate: e.target.value })}
            />
          </div>
          <Button type="submit" className="w-full">Save Changes</Button>
        </form>
      </Modal>

      {/* CSV Bulk Ingestion Upload Modal */}
      <CsvUploadModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onSuccess={() => triggerSuccess('CSV Bulk Inventory Ingestion Completed!')}
      />

      {/* Barcode & QR Code Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        onSuccess={() => triggerSuccess('Barcode Scanned Product Ingested!')}
      />

      {/* Publish Surplus Donation Modal */}
      <Modal isOpen={isPublishModalOpen} onClose={() => setIsPublishModalOpen(false)} title={`Publish Surplus Donation: ${activeItem?.product_name || ''}`}>
        <form className="space-y-4" onSubmit={handlePublishDonation}>
          <Input
            label="Donation Title"
            required
            value={publishForm.title}
            onChange={(e) => setPublishForm({ ...publishForm, title: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Quantity to Donate"
              type="number"
              required
              value={publishForm.quantity}
              onChange={(e) => setPublishForm({ ...publishForm, quantity: e.target.value })}
            />
            <Input
              label="Unit"
              required
              value={publishForm.unit}
              onChange={(e) => setPublishForm({ ...publishForm, unit: e.target.value })}
            />
          </div>
          <Input
            label="Food Image URL"
            value={publishForm.foodImageUrl}
            onChange={(e) => setPublishForm({ ...publishForm, foodImageUrl: e.target.value })}
            placeholder="https://images.unsplash.com/..."
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Pickup Window Date & Time"
              type="datetime-local"
              required
              value={publishForm.pickupTime}
              onChange={(e) => setPublishForm({ ...publishForm, pickupTime: e.target.value })}
            />
            <Input
              label="Food Expiry Date & Time"
              type="datetime-local"
              required
              value={publishForm.expiryDate}
              onChange={(e) => setPublishForm({ ...publishForm, expiryDate: e.target.value })}
            />
          </div>
          <Input
            label="Pickup Address"
            required
            value={publishForm.pickupAddress}
            onChange={(e) => setPublishForm({ ...publishForm, pickupAddress: e.target.value })}
          />

          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 mt-2">
            Publish Surplus Donation (Status: AVAILABLE)
          </Button>
        </form>
      </Modal>
    </div>
  );
};
