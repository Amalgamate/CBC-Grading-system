/**
 * shadcn/ui Components - Usage Guide
 * 
 * This guide shows how to use the newly added shadcn components
 * while maintaining your brand colors (purple & teal)
 */

// ============================================
// BUTTON COMPONENT
// ============================================

import { Button } from '@/components/ui'

// Basic button
<Button>Click me</Button>

// Button variants
<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="destructive">Delete</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Button sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">🔍</Button>

// With loading state
<Button disabled>
  <Loader className="animate-spin mr-2 h-4 w-4" />
  Loading...
</Button>

// With icon
<Button>
  <Plus className="mr-2 h-4 w-4" />
  Add Item
</Button>

// ============================================
// INPUT COMPONENT
// ============================================

import { Input, Label } from '@/components/ui'

// Basic input
<Input placeholder="Enter text..." />

// With label
<div>
  <Label htmlFor="name">Full Name</Label>
  <Input id="name" placeholder="John Doe" />
</div>

// With error
<Input placeholder="Email" className="border-red-500" />

// ============================================
// CARD COMPONENT
// ============================================

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui'

// Full card example
<Card>
  <CardHeader>
    <CardTitle>Class Information</CardTitle>
    <CardDescription>
      Manage class details and settings
    </CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content goes here */}
  </CardContent>
  <CardFooter>
    <Button>Save</Button>
  </CardFooter>
</Card>

// ============================================
// DIALOG COMPONENT
// ============================================

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui'

// Example usage with state
const [open, setOpen] = useState(false)

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Delete Class?</DialogTitle>
      <DialogDescription>
        This action cannot be undone. This will permanently delete the class.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline" onClick={() => setOpen(false)}>
        Cancel
      </Button>
      <Button variant="destructive" onClick={handleDelete}>
        Delete
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

// ============================================
// COMPLETE FORM EXAMPLE
// ============================================

import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { useState } from 'react'

export function ClassForm() {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    capacity: 40
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async () => {
    // API call
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Create New Class</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="name">Class Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Grade 5 Alpha"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="code">Class Code</Label>
            <Input
              id="code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="G5A"
            />
          </div>

          <div>
            <Label htmlFor="capacity">Capacity</Label>
            <Input
              id="capacity"
              name="capacity"
              type="number"
              value={formData.capacity}
              onChange={handleChange}
              min="1"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1">
            Create Class
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// COLOR CUSTOMIZATION
// ============================================

/**
 * Your brand colors are automatically applied:
 * 
 * Primary (Purple): #8b5cf6
 *   - Used for: buttons (default), inputs (focus), links
 * 
 * Secondary (Teal): #14b8a6
 *   - Used for: accent elements, hover states
 * 
 * To change colors, update in tailwind.config.js:
 * 
 * theme: {
 *   colors: {
 *     'brand-purple': '#your-color',
 *     'brand-teal': '#your-color'
 *   }
 * }
 */

// ============================================
// RECOMMENDED USAGE PATTERNS
// ============================================

/**
 * 1. FORMS
 * - Use Input + Label for data entry
 * - Use Button for submissions
 * 
 * 2. CONFIRMATIONS
 * - Use Dialog for delete confirmations
 * - Use variant="destructive" for dangerous actions
 * 
 * 3. DATA DISPLAY
 * - Use Card for grouped information
 * - Use CardHeader/CardTitle for section headers
 * 
 * 4. ACTIONS
 * - Use Button with icons for quick actions
 * - Use different variants for different priorities
 * 
 * 5. MODALS
 * - Use Dialog for forms and confirmations
 * - Always include a close button
 */
