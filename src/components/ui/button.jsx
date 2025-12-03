export function Button({ children, className, ...props }) {
    return (
      <button
        {...props}
        className={`px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 ${className}`}
      >
        {children}
      </button>
    );
  }
  