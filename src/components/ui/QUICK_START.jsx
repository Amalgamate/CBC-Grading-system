/**
 * ✨ shadcn/ui Setup Complete! ✨
 * 
 * You now have professional, production-ready UI components
 * integrated into your EDucore platform.
 * 
 * What's Available:
 * ✅ Button - Multiple variants (default, outline, destructive, ghost, link)
 * ✅ Input - Accessible form inputs with focus states
 * ✅ Label - Proper form labeling
 * ✅ Card - Content containers with structure
 * ✅ Dialog - Modal dialogs with animations
 * 
 * All components respect your brand colors (purple/teal)
 */

// ============================================
// QUICK START EXAMPLES
// ============================================

import { 
  Button, 
  Input, 
  Label, 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui'
import { Plus, Trash2, Edit } from 'lucide-react'
import { useState } from 'react'

// ============================================
// EXAMPLE 1: Simple Button Gallery
// ============================================

export function ButtonGallery() {
  return (
    <div className="flex flex-wrap gap-4 p-8">
      <Button>Default (Purple)</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="destructive">Delete</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
      
      {/* With Icons */}
      <Button>
        <Plus className="mr-2 h-4 w-4" />
        Add Item
      </Button>
      
      {/* Sizes */}
      <Button size="sm">Small</Button>
      <Button size="lg">Large</Button>
      
      {/* Disabled */}
      <Button disabled>Disabled</Button>
    </div>
  )
}

// ============================================
// EXAMPLE 2: Form with shadcn Components
// ============================================

export function ClassFormExample() {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    capacity: 40
  })

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Create New Class</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Name Field */}
        <div>
          <Label htmlFor="name">Class Name</Label>
          <Input
            id="name"
            placeholder="e.g., Grade 5 Alpha"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
          />
        </div>

        {/* Code & Capacity in Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="code">Class Code</Label>
            <Input
              id="code"
              placeholder="G5A"
              value={formData.code}
              onChange={(e) => setFormData(prev => ({...prev, code: e.target.value}))}
            />
          </div>
          <div>
            <Label htmlFor="capacity">Capacity</Label>
            <Input
              id="capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData(prev => ({...prev, capacity: e.target.value}))}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" className="flex-1">
            Cancel
          </Button>
          <Button className="flex-1">
            <Plus className="mr-2 h-4 w-4" />
            Create Class
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// EXAMPLE 3: Dialog / Modal Example
// ============================================

export function DeleteConfirmExample() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="destructive">
        Delete Class
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Class?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the class
              and remove all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ============================================
// EXAMPLE 4: Card with Actions
// ============================================

export function ClassCardExample() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Grade 5 Alpha</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-gray-600">Code</p>
          <p className="font-bold">G5A</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Stream</p>
            <p className="font-bold">A</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Capacity</p>
            <p className="font-bold">40 Students</p>
          </div>
        </div>
        <div className="flex gap-2 pt-4">
          <Button variant="outline" size="sm" className="flex-1">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" className="flex-1">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// FULL INTEGRATION EXAMPLE
// ============================================

/**
 * 🎯 NEXT STEPS
 * 
 * 1. Try using these components in your existing pages
 * 2. Update FacilityManager to use shadcn Button, Input, Dialog, Card
 * 3. Update HeadTeacherDashboard buttons to use shadcn Button
 * 4. Gradually migrate other components
 * 
 * 📍 Import Example:
 * 
 * import { Button, Input, Card, CardContent, Dialog } from '@/components/ui'
 * 
 * ✨ Benefits You'll See:
 * - Smoother animations
 * - Better form UX
 * - Consistent styling everywhere
 * - Professional appearance
 * - Better accessibility
 * - Less code to maintain
 * 
 * 🎨 Your Colors Are Automatically Applied:
 * - Purple (#8b5cf6) for primary actions
 * - Teal (#14b8a6) for accents
 */

export default ClassFormExample
