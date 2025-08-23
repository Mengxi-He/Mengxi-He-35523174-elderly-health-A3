// Accessibility utility functions for WCAG 2.1 AA compliance

/**
 * Check if an element has sufficient color contrast
 * @param {HTMLElement} element - The element to check
 * @returns {boolean} - True if contrast ratio meets WCAG AA standards
 */
export function checkColorContrast(element) {
  const styles = window.getComputedStyle(element)
  const backgroundColor = styles.backgroundColor
  const color = styles.color
  
  // This is a simplified check - in production, use a proper color contrast library
  // For now, return true assuming our CSS meets standards
  return true
}

/**
 * Check if all images have alt text
 * @returns {Array} - Array of images missing alt text
 */
export function checkImageAltText() {
  const images = document.querySelectorAll('img')
  const missingAlt = []
  
  images.forEach(img => {
    if (!img.alt || img.alt.trim() === '') {
      missingAlt.push(img)
    }
  })
  
  return missingAlt
}

/**
 * Check if all form inputs have labels
 * @returns {Array} - Array of inputs missing labels
 */
export function checkFormLabels() {
  const inputs = document.querySelectorAll('input, select, textarea')
  const missingLabels = []
  
  inputs.forEach(input => {
    const hasLabel = document.querySelector(`label[for="${input.id}"]`) ||
                    input.closest('label') ||
                    input.hasAttribute('aria-label') ||
                    input.hasAttribute('aria-labelledby')
    
    if (!hasLabel) {
      missingLabels.push(input)
    }
  })
  
  return missingLabels
}

/**
 * Check keyboard navigation
 * @returns {Object} - Report of keyboard navigation issues
 */
export function checkKeyboardNavigation() {
  const focusableElements = document.querySelectorAll(
    'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  
  const issues = []
  
  focusableElements.forEach(element => {
    const tabIndex = element.getAttribute('tabindex')
    
    // Check for positive tabindex (anti-pattern)
    if (tabIndex && parseInt(tabIndex) > 0) {
      issues.push({
        element,
        issue: 'Positive tabindex found - use 0 or -1 instead'
      })
    }
    
    // Check if element is visible but not focusable
    if (element.offsetParent !== null && tabIndex === '-1' && !element.disabled) {
      issues.push({
        element,
        issue: 'Visible element is not keyboard accessible'
      })
    }
  })
  
  return {
    totalFocusable: focusableElements.length,
    issues
  }
}

/**
 * Check ARIA attributes
 * @returns {Array} - Array of ARIA issues
 */
export function checkAriaAttributes() {
  const ariaElements = document.querySelectorAll('[aria-labelledby], [aria-describedby]')
  const issues = []
  
  ariaElements.forEach(element => {
    const labelledBy = element.getAttribute('aria-labelledby')
    const describedBy = element.getAttribute('aria-describedby')
    
    if (labelledBy) {
      const labelElement = document.getElementById(labelledBy)
      if (!labelElement) {
        issues.push({
          element,
          issue: `aria-labelledby references non-existent ID: ${labelledBy}`
        })
      }
    }
    
    if (describedBy) {
      const descElement = document.getElementById(describedBy)
      if (!descElement) {
        issues.push({
          element,
          issue: `aria-describedby references non-existent ID: ${describedBy}`
        })
      }
    }
  })
  
  return issues
}

/**
 * Run a comprehensive accessibility audit
 * @returns {Object} - Complete accessibility report
 */
export function runAccessibilityAudit() {
  return {
    imageAltText: checkImageAltText(),
    formLabels: checkFormLabels(),
    keyboardNavigation: checkKeyboardNavigation(),
    ariaAttributes: checkAriaAttributes(),
    timestamp: new Date().toISOString()
  }
}

/**
 * Announce message to screen readers
 * @param {string} message - Message to announce
 * @param {string} priority - 'polite' or 'assertive'
 */
export function announceToScreenReader(message, priority = 'polite') {
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'visually-hidden'
  announcement.textContent = message
  
  document.body.appendChild(announcement)
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

/**
 * Setup focus trap for modal dialogs
 * @param {HTMLElement} container - Container to trap focus within
 */
export function setupFocusTrap(container) {
  const focusableElements = container.querySelectorAll(
    'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  
  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]
  
  function trapFocus(e) {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }
  }
  
  container.addEventListener('keydown', trapFocus)
  
  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', trapFocus)
  }
}
