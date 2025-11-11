// Simple toast notification system without external dependencies
type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  type?: ToastType;
  duration?: number;
}

class ToastManager {
  private container: HTMLDivElement | null = null;

  private ensureContainer() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: none;
      `;
      document.body.appendChild(this.container);
    }
    return this.container;
  }

  private getToastStyles(type: ToastType): string {
    const baseStyles = `
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 500;
      min-width: 300px;
      max-width: 500px;
      pointer-events: auto;
      animation: slideIn 0.3s ease-out;
    `;

    const typeStyles = {
      success: 'background: #10b981; color: white;',
      error: 'background: #ef4444; color: white;',
      info: 'background: #3b82f6; color: white;',
      warning: 'background: #f59e0b; color: white;',
    };

    return baseStyles + typeStyles[type];
  }

  private getIcon(type: ToastType): string {
    const icons = {
      success: '✓',
      error: '✗',
      info: 'ℹ',
      warning: '⚠',
    };
    return icons[type];
  }

  show(message: string, options: ToastOptions = {}) {
    const { type = 'info', duration = 3000 } = options;
    const container = this.ensureContainer();

    const toast = document.createElement('div');
    toast.style.cssText = this.getToastStyles(type);
    
    const icon = document.createElement('span');
    icon.style.cssText = 'font-size: 18px; font-weight: bold;';
    icon.textContent = this.getIcon(type);
    
    const text = document.createElement('span');
    text.textContent = message;
    
    toast.appendChild(icon);
    toast.appendChild(text);
    container.appendChild(toast);

    // Add CSS animation
    if (!document.getElementById('toast-animations')) {
      const style = document.createElement('style');
      style.id = 'toast-animations';
      style.textContent = `
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    // Auto dismiss
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        container.removeChild(toast);
        if (container.children.length === 0) {
          document.body.removeChild(container);
          this.container = null;
        }
      }, 300);
    }, duration);
  }

  success(message: string, duration?: number) {
    this.show(message, { type: 'success', duration });
  }

  error(message: string, duration?: number) {
    this.show(message, { type: 'error', duration });
  }

  info(message: string, duration?: number) {
    this.show(message, { type: 'info', duration });
  }

  warning(message: string, duration?: number) {
    this.show(message, { type: 'warning', duration });
  }
}

// Export singleton instance
export const toast = new ToastManager();
