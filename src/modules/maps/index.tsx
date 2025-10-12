import React from 'react';

const HeavyMap: React.FC = () => {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 text-center">Our Store Locations</h3>
      <div className="bg-gray-200 h-96 w-full rounded-lg flex items-center justify-center">
        <p className="text-gray-500">[This is a placeholder for a heavy map component like Google Maps or Leaflet]</p>
      </div>
    </div>
  );
};

// This is a large comment block to simulate a larger file size for this module.
// In a real-world scenario, a mapping library would be quite large.
// This helps demonstrate the benefit of dynamically importing it only when needed.
// Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
// Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
// Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
// ... (imagine many more lines of code or comments here)
// Total simulated size: ~200KB

export default HeavyMap;
