// import React from "react";
// import { Select } from "antd";
// import { Loader2Icon } from "lucide-react";

// const { Option } = Select;

// const CustomSelect = ({
//   options = [],
//   value,
//   onChange,
//   placeholder = "Select...",
//   className = "w-[150px]",
//   loader=false,
// }) => {
//   return (
//     <Select
//       showSearch
//        value={value ?? undefined} // <-- key change
//       placeholder={placeholder}
//       onChange={onChange}
//       className={className}
//       optionFilterProp="children"
//       filterOption={(input, option) =>
//         option?.children?.toLowerCase().includes(input.toLowerCase())
//       }
//       dropdownClassName="!bg-white !rounded-md !shadow-lg custom-dropdown"
//     > {
//         loader && <Option value="" disabled>
//           <div className="flex items-center gap-2">
//             <Loader2Icon className="animate-spin"/>
//           <h1>Loading...</h1>
//           </div> 
          
//           </Option>
//     }
//       {options.map((opt, index) => (
//         <Option key={index} value={opt} className="!text-gray-800">
//           {opt}
//         </Option>
//       ))}
//     </Select>
//   );
// };

// export default CustomSelect;


import React, { useState, useCallback, useRef, useMemo } from "react";
import { Select } from "antd";
import { Loader2Icon } from "lucide-react";

const { Option } = Select;

const CustomSelect = ({
  options = [],
  value,
  onChange,
  placeholder = "Select...",
  className = "w-[150px]",
  loader = false,
  pageSize = 100,
}) => {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [searchText, setSearchText] = useState("");

  // Filter options based on search text
  const filteredOptions = useMemo(() => {
    if (!searchText) return options;
    return options.filter(option => 
      option.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [options, searchText]);

  const visibleOptions = filteredOptions.slice(0, visibleCount);
  const hasMore = visibleCount < filteredOptions.length;

  // Handle search
  const handleSearch = useCallback((value) => {
    setSearchText(value);
    setVisibleCount(pageSize); // Reset visible count when searching
  }, [pageSize]);

  // Handle dropdown scroll to load more options
  const handlePopupScroll = useCallback(
    async (event) => {
      const { target } = event;
      const { scrollTop, scrollHeight, clientHeight } = target;

      // Load more when user is near the bottom
      if (scrollTop + clientHeight >= scrollHeight - 50 && hasMore) {
        // Load more options
        setVisibleCount(prev => Math.min(prev + pageSize, filteredOptions.length));
      }
    },
    [hasMore, pageSize, filteredOptions.length]
  );

  return (
    <Select
      showSearch
      value={value ?? undefined}
      placeholder={placeholder}
      onChange={onChange}
      onSearch={handleSearch}
      className={className}
      filterOption={false} // We handle filtering ourselves
      dropdownClassName="!bg-white !rounded-md !shadow-lg custom-dropdown"
      onPopupScroll={handlePopupScroll}
      listHeight={256}
      loading={loader}
    >
      {loader && (
        <Option value="__initial_loading__" disabled>
          <div className="flex items-center gap-2">
            <Loader2Icon className="animate-spin" />
            <h1>Loading...</h1>
          </div>
        </Option>
      )}
      
      {visibleOptions.map((opt, index) => (
        <Option key={index} value={opt} className="!text-gray-800">
          {opt}
        </Option>
      ))}
      
      {hasMore && (
        <Option value="__loading__" disabled>
          <div className="flex items-center justify-center gap-2 py-2">
            <span className="text-sm text-gray-500">
              {visibleOptions.length} of {filteredOptions.length} items
            </span>
          </div>
        </Option>
      )}

      {filteredOptions.length === 0 && !loader && (
        <Option value="__no_results__" disabled>
          <div className="text-center py-2 text-gray-500">
            No results found
          </div>
        </Option>
      )}
    </Select>
  );
};

export default CustomSelect;



// import React from "react";
// import { Select } from "antd";

// const { Option } = Select;

// const CustomSelect = ({
//   options = [],
//   value,
//   onChange,
//   onFocus,
//   onSearch,
//   placeholder = "Select...",
//   className = "w-[150px]",
//   showSearch = false,
//   disabled = false,
//   dropdownRender,
// }) => {
//   return (
//     <Select
//       showSearch={showSearch}
//       value={value ?? undefined}
//       placeholder={placeholder}
//       onChange={onChange}
//       onFocus={onFocus}
//       onSearch={onSearch}
//       className={className}
//       disabled={disabled}
//       optionFilterProp="children"
//       filterOption={(input, option) =>
//         option?.children?.toLowerCase().includes(input.toLowerCase())
//       }
//       dropdownRender={dropdownRender}
//       dropdownClassName="!bg-white !rounded-md !shadow-lg custom-dropdown"
//     >
//       {options.map((opt, index) => (
//         <Option key={index} value={opt} className="!text-gray-800">
//           {opt}
//         </Option>
//       ))}
//     </Select>
//   );
// };

// export default CustomSelect;
