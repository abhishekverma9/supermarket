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
                  <FaFilter className="text-orange-500 text-xl" />
                  <h3 className="text-2xl font-extrabold text-orange-500 tracking-wide">
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
                className="w-full mb-6 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500/30 to-[#FF5E00]/30 text-orange-500 font-semibold tracking-wide hover:from-orange-500/50 hover:to-[#FF5E00]/50 transition-all shadow-lg"
              >
                Clear All Filters
              </button>

              {/* Category Filter */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold mb-3 pb-2 border-b border-gray-700 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-orange-500"></span>
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
                        className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-orange-500 focus:ring-[#FF8C00] accent-[#FF8C00]"
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

              {/* Price Range Filter */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold mb-3 pb-2 border-b border-gray-700 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                  Price Range
                </h4>
                <div className="flex flex-col gap-2">
                  {[
                    { label: "Under ₹100", min: 0, max: 100 },
                    { label: "₹100 - ₹500", min: 100, max: 500 },
                    { label: "₹500 - ₹1000", min: 500, max: 1000 },
                    { label: "₹1000 - ₹5000", min: 1000, max: 5000 },
                    { label: "Above ₹5000", min: 5000, max: 999999 },
                  ].map((range) => (
                    <button
                      key={range.label}
                      onClick={() => onFilterChange("priceRange", range)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium text-left transition-all border ${
                        selectedFilters.priceRange?.label === range.label
                          ? "bg-orange-500/20 text-orange-500 border-[#FF8C00]/40"
                          : "bg-white/5 text-gray-300 border-white/10 hover:border-white/20"
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-center text-sm text-gray-600 mt-10">
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
