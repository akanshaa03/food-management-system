import React, { useState, useEffect } from 'react';
import { categoryService } from '../../services/categoryService';
import { Table } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Tag, Plus, Edit2, Trash2, CheckCircle2, ShieldAlert, Layers, Thermometer, AlertTriangle, AlertCircle } from 'lucide-react';

export const BusinessCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);

  // Forms
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    foodTaxonomyCode: 'TAX-BAKERY',
    perishabilityLevel: 'HIGH',
    storageRequirement: 'AMBIENT',
    description: '',
  });

  const fetchCategories = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await categoryService.getCategories();
      if (res && res.success && res.data) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('PostgreSQL Categories fetch error:', err);
      setErrorMsg('Failed to load categories from PostgreSQL database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const triggerSuccess = (msg) => {
    setFeedbackMsg(msg);
    fetchCategories();
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await categoryService.createCategory(categoryForm);
      setIsAddModalOpen(false);
      triggerSuccess(`Category "${categoryForm.name}" created in PostgreSQL!`);
    } catch (err) {
      setErrorMsg(`Failed to create category "${categoryForm.name}": ${err?.message || 'Server error'}`);
    }
  };

  const handleEditCategory = async (e) => {
    e.preventDefault();
    try {
      await categoryService.updateCategory(activeCategory.id, categoryForm);
      setIsEditModalOpen(false);
      triggerSuccess(`Category "${categoryForm.name}" updated in PostgreSQL!`);
    } catch (err) {
      setErrorMsg(`Failed to update category "${categoryForm.name}": ${err?.message || 'Server error'}`);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"?`)) return;
    try {
      await categoryService.deleteCategory(id);
      triggerSuccess(`Category "${name}" deleted from PostgreSQL.`);
    } catch (err) {
      setErrorMsg(`Failed to delete category "${name}": ${err?.message || 'Server error'}`);
    }
  };

  const openEditModal = (cat) => {
    setActiveCategory(cat);
    setCategoryForm({
      name: cat.name,
      foodTaxonomyCode: cat.food_taxonomy_code || 'TAX-GENERAL',
      perishabilityLevel: cat.perishability_level || 'MEDIUM',
      storageRequirement: cat.storage_requirement || 'AMBIENT',
      description: cat.description || '',
    });
    setIsEditModalOpen(true);
  };

  const columns = [
    { header: 'Category Name', accessorKey: 'name' },
    {
      header: 'Taxonomy Code',
      render: (r) => (
        <span className="px-2 py-0.5 font-mono text-xs font-bold bg-gray-100 text-gray-800 rounded">
          {r.food_taxonomy_code}
        </span>
      ),
    },
    {
      header: 'Perishability',
      render: (r) => {
        const lvl = r.perishability_level;
        if (lvl === 'HIGH') return <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-red-100 text-red-800">HIGH (1-3 Days)</span>;
        if (lvl === 'MEDIUM') return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">MEDIUM (4-14 Days)</span>;
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">LOW (15+ Days)</span>;
      },
    },
    {
      header: 'Storage Requirement',
      render: (r) => {
        const req = r.storage_requirement;
        if (req === 'CHILLED') return <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800">🧊 CHILLED (0-4°C)</span>;
        if (req === 'FROZEN') return <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-100 text-indigo-800">❄️ FROZEN (-18°C)</span>;
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-800">📦 AMBIENT / DRY</span>;
      },
    },
    {
      header: 'Assigned Products',
      render: (r) => <strong className="text-gray-900 font-extrabold">{r.product_count || 0} Products ({r.total_quantity || 0} kg)</strong>,
    },
    {
      header: 'Actions',
      render: (r) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => openEditModal(r)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg"
            title="Edit Category"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteCategory(r.id, r.name)}
            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
            title="Delete Category"
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
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Tag className="h-6 w-6 text-emerald-600 mr-2" /> Product Categorization & Food Taxonomy
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage food categories, perishability levels, storage requirements & PostgreSQL statistics</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Category
        </Button>
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

      {/* Main Table */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <Table columns={columns} data={categories} />
      </div>

      {/* Add Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create Food Taxonomy Category">
        <form className="space-y-4" onSubmit={handleCreateCategory}>
          <Input
            label="Category Name"
            required
            value={categoryForm.name}
            onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
            placeholder="e.g. Prepared & Cooked Meals"
          />
          <Input
            label="Food Taxonomy Code"
            value={categoryForm.foodTaxonomyCode}
            onChange={(e) => setCategoryForm({ ...categoryForm, foodTaxonomyCode: e.target.value })}
            placeholder="e.g. TAX-PREPARED"
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Perishability Level</label>
              <select
                value={categoryForm.perishabilityLevel}
                onChange={(e) => setCategoryForm({ ...categoryForm, perishabilityLevel: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="HIGH">HIGH (1-3 Days Shelf Life)</option>
                <option value="MEDIUM">MEDIUM (4-14 Days Shelf Life)</option>
                <option value="LOW">LOW (15+ Days Shelf Life)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Storage Requirement</label>
              <select
                value={categoryForm.storageRequirement}
                onChange={(e) => setCategoryForm({ ...categoryForm, storageRequirement: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="AMBIENT">AMBIENT (Room Temp)</option>
                <option value="CHILLED">CHILLED (Refrigerated 0-4°C)</option>
                <option value="FROZEN">FROZEN (-18°C Deep Freeze)</option>
                <option value="DRY_STORAGE">DRY STORAGE (Cool & Dry)</option>
              </select>
            </div>
          </div>
          <Input
            label="Description"
            value={categoryForm.description}
            onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
            placeholder="Detailed description of category items..."
          />
          <Button type="submit" className="w-full">Create Category</Button>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Category: ${activeCategory?.name}`}>
        <form className="space-y-4" onSubmit={handleEditCategory}>
          <Input
            label="Category Name"
            required
            value={categoryForm.name}
            onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
          />
          <Input
            label="Food Taxonomy Code"
            value={categoryForm.foodTaxonomyCode}
            onChange={(e) => setCategoryForm({ ...categoryForm, foodTaxonomyCode: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Perishability Level</label>
              <select
                value={categoryForm.perishabilityLevel}
                onChange={(e) => setCategoryForm({ ...categoryForm, perishabilityLevel: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="HIGH">HIGH (1-3 Days Shelf Life)</option>
                <option value="MEDIUM">MEDIUM (4-14 Days Shelf Life)</option>
                <option value="LOW">LOW (15+ Days Shelf Life)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Storage Requirement</label>
              <select
                value={categoryForm.storageRequirement}
                onChange={(e) => setCategoryForm({ ...categoryForm, storageRequirement: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="AMBIENT">AMBIENT (Room Temp)</option>
                <option value="CHILLED">CHILLED (Refrigerated 0-4°C)</option>
                <option value="FROZEN">FROZEN (-18°C Deep Freeze)</option>
                <option value="DRY_STORAGE">DRY STORAGE (Cool & Dry)</option>
              </select>
            </div>
          </div>
          <Button type="submit" className="w-full">Save Changes</Button>
        </form>
      </Modal>
    </div>
  );
};
