/**
 * shadcn/ui - Migration Guide for EDucore
 * 
 * This shows how to refactor existing components to use shadcn
 * while keeping your current functionality intact
 * 
 * BEFORE: Traditional approach (current)
 * AFTER: shadcn approach (recommended)
 */

// ============================================
// SIMPLE BUTTON REFACTOR
// ============================================

// BEFORE - Custom styling everywhere
<button className="flex items-center gap-2 px-4 py-2 bg-brand-purple text-white rounded-lg hover:bg-brand-purple/90 transition-colors disabled:opacity-50">
  <Plus size={16} />
  New Item
</button>

// AFTER - Clean, consistent
import { Button } from '@/components/ui'
<Button>
  <Plus className="mr-2 h-4 w-4" />
  New Item
</Button>


// ============================================
// FORM INPUT REFACTOR
// ============================================

// BEFORE - Custom input styling
const [formData, setFormData] = useState({ name: '' })

<input
  type="text"
  name="name"
  value={formData.name}
  onChange={(e) => setFormData(prev => ({...prev, [e.target.name]: e.target.value}))}
  placeholder="e.g., Grade 5 Alpha"
  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
/>

// AFTER - With label and proper structure
import { Input, Label } from '@/components/ui'

const [formData, setFormData] = useState({ name: '' })

<div>
  <Label htmlFor="name">Class Name *</Label>
  <Input
    id="name"
    name="name"
    value={formData.name}
    onChange={(e) => setFormData(prev => ({...prev, [e.target.name]: e.target.value}))}
    placeholder="e.g., Grade 5 Alpha"
  />
</div>


// ============================================
// MODAL/DIALOG REFACTOR
// ============================================

// BEFORE - Complex custom modal
const [deleteConfirm, setDeleteConfirm] = useState(null)

{deleteConfirm && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg p-6 max-w-sm w-full">
      <h3 className="text-lg font-black text-gray-900">Delete Class?</h3>
      <p className="text-gray-600 mt-2">
        Are you sure? This cannot be undone.
      </p>
      <div className="flex gap-3 mt-6">
        <button onClick={() => setDeleteConfirm(null)}>Cancel</button>
        <button onClick={() => handleDelete(deleteConfirm)}>Delete</button>
      </div>
    </div>
  </div>
)}

// AFTER - Clean dialog component
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui'
import { Button } from '@/components/ui'

const [deleteConfirm, setDeleteConfirm] = useState(null)

<Dialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Delete Class?</DialogTitle>
      <DialogDescription>
        This action cannot be undone. This will permanently delete the class.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
        Cancel
      </Button>
      <Button variant="destructive" onClick={() => handleDelete(deleteConfirm)}>
        Delete
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>


// ============================================
// CARD/SECTION REFACTOR
// ============================================

// BEFORE - Custom card styling
<div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
  <h3 className="text-lg font-black text-gray-900">Class Name</h3>
  <p className="text-sm text-gray-500 mt-1">Code: <span className="font-bold">G5A</span></p>
  
  <div className="space-y-2 mb-4 mt-3">
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">Stream:</span>
      <span className="font-bold text-gray-900">A</span>
    </div>
  </div>
  
  <div className="flex gap-2">
    <button className="flex-1 px-3 py-2 border...">Edit</button>
    <button className="flex-1 px-3 py-2 border...">Delete</button>
  </div>
</div>

// AFTER - Structured card component
import { Card, CardContent } from '@/components/ui'
import { Button } from '@/components/ui'

<Card>
  <CardContent className="pt-6">
    <h3 className="text-lg font-black text-gray-900">Class Name</h3>
    <p className="text-sm text-gray-500 mt-1">
      Code: <span className="font-bold">G5A</span>
    </p>
    
    <div className="space-y-2 mb-4 mt-3">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Stream:</span>
        <span className="font-bold text-gray-900">A</span>
      </div>
    </div>
    
    <div className="flex gap-2">
      <Button variant="outline" className="flex-1">Edit</Button>
      <Button variant="destructive" className="flex-1">Delete</Button>
    </div>
  </CardContent>
</Card>


// ============================================
// COMPLETE COMPONENT REFACTOR EXAMPLE
// ============================================

// BEFORE: FacilityManager (current implementation)
export function FacilityManagerBefore() {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-gray-900">Facilities</h1>
        <button className="px-4 py-2 bg-brand-purple text-white rounded-lg">
          + New Class
        </button>
      </div>

      {/* Long custom rendering code... */}
    </div>
  )
}

// AFTER: FacilityManager (with shadcn)
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui'
import { Plus, Edit, Trash2, RefreshCw, Loader, Search } from 'lucide-react'

export function FacilityManagerAfter() {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="space-y-6">
      {/* Header with shadcn Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Facility Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage classes and facilities</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Class
          </Button>
        </div>
      </div>

      {/* Search with shadcn Input */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-3 text-gray-400" />
        <Input
          placeholder="Search classes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Class Cards - Each is a shadcn Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map(classItem => (
          <Card key={classItem.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{classItem.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Code:</span>
                  <span className="font-bold">{classItem.code}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Capacity:</span>
                  <span className="font-bold">{classItem.capacity}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit size={14} className="mr-1" />
                  Edit
                </Button>
                <Button variant="destructive" size="sm" className="flex-1">
                  <Trash2 size={14} className="mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Confirmation Dialog - shadcn Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={setDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Class?</DialogTitle>
            <DialogDescription>
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


// ============================================
// MIGRATION CHECKLIST
// ============================================

/**
 * Step-by-step migration path:
 * 
 * Priority 1 (Do First):
 * ☑ Replace all custom buttons with <Button>
 * ☑ Replace all form inputs with <Input>
 * ☑ Replace all modals/dialogs with <Dialog>
 * 
 * Priority 2 (Do Next):
 * ☑ Wrap section containers with <Card>
 * ☑ Use <Label> for all form fields
 * ☑ Replace custom labels with <CardTitle>
 * 
 * Priority 3 (Nice to Have):
 * ☑ Use Button variants for different actions
 * ☑ Add icons to buttons
 * ☑ Use size props for consistency
 * 
 * Testing:
 * ☑ Test all click interactions
 * ☑ Test form submissions
 * ☑ Test mobile responsiveness
 * ☑ Verify color consistency
 * ☑ Check accessibility (keyboard navigation)
 */
