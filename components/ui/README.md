# UI Components Library

A collection of reusable, accessible, and customizable React components built with TypeScript and Tailwind CSS.

## Components

### Button
A versatile button component with multiple variants, sizes, and loading states.

```tsx
import { Button } from '../ui'

<Button 
  variant="primary" 
  size="md" 
  loading={false}
  icon={<SomeIcon />}
  onClick={handleClick}
>
  Click me
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
- `size`: 'sm' | 'md' | 'lg'
- `loading`: boolean
- `icon`: ReactNode
- `iconPosition`: 'left' | 'right'
- `fullWidth`: boolean

### Input
A flexible input component with labels, error states, and icons.

```tsx
import { Input } from '../ui'

<Input
  label="Email"
  type="email"
  placeholder="Enter your email"
  error={errorMessage}
  leftIcon={<MailIcon />}
  fullWidth
/>
```

**Props:**
- `label`: string
- `error`: string
- `helperText`: string
- `leftIcon`: ReactNode
- `rightIcon`: ReactNode
- `fullWidth`: boolean

### Modal
A customizable modal component with backdrop, escape handling, and size variants.

```tsx
import { Modal } from '../ui'

<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Modal Title"
  size="md"
>
  <p>Modal content goes here</p>
</Modal>
```

**Props:**
- `isOpen`: boolean
- `onClose`: () => void
- `title`: string
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `showCloseButton`: boolean
- `closeOnEscape`: boolean
- `closeOnBackdrop`: boolean

### Avatar
A user avatar component with fallback support and multiple sizes.

```tsx
import { Avatar } from '../ui'

<Avatar
  src={user.avatar_url}
  alt={user.name}
  size="md"
  fallback={user.name}
  onClick={handleClick}
/>
```

**Props:**
- `src`: string
- `alt`: string
- `size`: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
- `fallback`: string
- `onClick`: () => void

### Badge
A small badge component for status indicators and labels.

```tsx
import { Badge } from '../ui'

<Badge variant="success" size="sm">
  Active
</Badge>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
- `size`: 'sm' | 'md'

### LoadingSpinner
A customizable loading spinner with size and color variants.

```tsx
import { LoadingSpinner } from '../ui'

<LoadingSpinner size="md" color="primary" />
```

**Props:**
- `size`: 'xs' | 'sm' | 'md' | 'lg'
- `color`: 'primary' | 'secondary' | 'white'

### UserCard
A pre-built user card component that combines Avatar, user info, and badges.

```tsx
import { UserCard } from '../ui'

<UserCard
  user={user}
  currentUserId={currentUserId}
  selected={isSelected}
  onClick={handleUserSelect}
  showEmail
/>
```

**Props:**
- `user`: User (extended with email & phone)
- `currentUserId`: string
- `selected`: boolean
- `onClick`: (user) => void
- `showEmail`: boolean
- `className`: string

## Features

- **TypeScript Support**: Full type safety with comprehensive interfaces
- **Accessibility**: ARIA labels and keyboard navigation
- **Customizable**: Multiple variants, sizes, and styling options
- **Responsive**: Mobile-first design approach
- **Consistent**: Unified design system across components
- **Performance**: Optimized re-renders with proper dependencies

## Usage

```tsx
import { Button, Input, Modal, Avatar, Badge, LoadingSpinner, UserCard } from '../ui'
```

All components are exported from the main `index.ts` file for easy importing.
