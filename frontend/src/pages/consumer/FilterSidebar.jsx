import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaFilter } from "react-icons/fa";

// Sidebar animation
const sidebarVariants = {
  hidden: { x: "-100%" },
  visible: { x: 0, transition: { type: "spring", stiffness: 260, damping: 25 } },
  exit: { x: "-100%", transition: { duration: 0.25 } },
};

// Backdrop animation
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const FilterSidebar = ({
  isOpen,
  onClose,
  availableCategories,
  selectedFilters,
  onFilterChange,
  onClearFilters,
}) => {
  const handleCategoryChange = (category) => {
    onFilterChange("category", category);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            className="fixed top-0 left-0 w-full max-w-sm h-full bg-[#141414] border-r border-[#FF8C00]/40 z-50 shadow-2xl overflow-y-auto"
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="p-6 text-[#F5F5F5]">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <FaFilter className="text-[#FF8C00] text-xl" />
                  <h3 className="text-2xl font-extrabold text-[#FF8C00] tracking-wide">
                    Filters
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              {/* Clear All Button */}
              <button
                onClick={onClearFilters}
                className="w-full mb-6 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF8C00]/30 to-[#FF5E00]/30 text-[#FF8C00] font-semibold tracking-wide hover:from-[#FF8C00]/50 hover:to-[#FF5E00]/50 transition-all shadow-lg"
              >
                Clear All Filters
              </button>

              {/* Category Filter */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold mb-3 pb-2 border-b border-gray-700 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#FF8C00]"></span>
                  Category
                </h4>
                <div className="flex flex-col gap-3">
                  {availableCategories.map((category) => (
                    <label
                      key={category}
                      className="flex items-center gap-3 cursor-pointer px-3 py-2 rounded-lg hover:bg-white/5 transition"
                    >
                      <input
                        type="checkbox"
                        className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-[#FF8C00] focus:ring-[#FF8C00] accent-[#FF8C00]"
                        checked={selectedFilters.categories.includes(category)}
                        onChange={() => handleCategoryChange(category)}
                      />
                      <span className="capitalize text-[15px] font-medium text-gray-200">
                        {category}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* No Price Filter (Removed) */}
              <div className="text-center text-sm text-gray-500 mt-10">
                — End of Filters —
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FilterSidebar;
