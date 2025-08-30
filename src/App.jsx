import React, { useState, useEffect, useCallback } from "react";
import CustomSelect from "./utils/CustomSelect";

function App() {
  const [medicines, setMedicines] = useState([]);
  const [investigations, setInvestigations] = useState([]);

  // Form state
  const [formState, setFormState] = useState({
    admissionNumber: "",
    staffName: "",
    consultantName: "",
    patientName: "",
    uhidNumber: "",
    age: "",
    gender: "",
    wardLocation: "",
    category: "",
    room: "",
    diagnosis: "",
  });

  // Request type checkboxes state
  const [requestTypes, setRequestTypes] = useState({
    medicineSlip: true,
    investigation: false,
    package: false,
    nonPackage: false,
  });

  // Availability flags for sections
  const hasMedicines = requestTypes.medicineSlip;
  const hasInvestigations =
    requestTypes.investigation ||
    requestTypes.package ||
    requestTypes.nonPackage;

  // Active content tab: 'medicines' | 'investigations'
  const [activeTab, setActiveTab] = useState("medicines");

  // Keep activeTab in sync with what is available
  useEffect(() => {
    if (!hasMedicines && hasInvestigations) {
      setActiveTab("investigations");
    } else if (hasMedicines && !hasInvestigations) {
      setActiveTab("medicines");
    }
  }, [hasMedicines, hasInvestigations]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState({
      ...formState,
      [name]: value,
    });
  };

  // Medicine Slip and Investigation are mutually exclusive
  const handleCheckboxChange = (type) => {
    if (type === "medicineSlip") {
      setRequestTypes({
        medicineSlip: true,
        investigation: false,
        package: requestTypes.package,
        nonPackage: requestTypes.nonPackage,
      });
      setActiveTab("medicines");
      setSelectedInvestigation(""); // Clear investigation selection
    } else if (type === "investigation") {
      setRequestTypes({
        medicineSlip: false,
        investigation: true,
        package: requestTypes.package,
        nonPackage: requestTypes.nonPackage,
      });
      setActiveTab("investigations");
      setMedicines([]); // Clear medicines selection
    }
    // Package and Non-Package are mutually exclusive
    else if (type === "package" || type === "nonPackage") {
      const nextTypes = {
        // Keep medicineSlip/investigation states as they are
        medicineSlip: requestTypes.medicineSlip,
        investigation: requestTypes.investigation,
        package: type === "package",
        nonPackage: type === "nonPackage",
      };
      setRequestTypes(nextTypes);

      // Switch to investigations tab when selecting package/nonPackage
      setActiveTab("investigations");
    }
  };

  // Handle medicine button click
  const handleMedicineButtonClick = () => {
    // console.log("🔵 Medicine button clicked!");
    // console.log("📋 Current form state:", formState);
    // console.log("💊 Current medicines:", medicines);
    // console.log("🔬 Selected investigations:", selectedInvestigations);

    // Validate that form has required data
    if (!formState.patientName || !formState.admissionNumber) {
      console.log(
        "❌ Validation failed: Missing patient name or admission number"
      );
      alert("Please fill in patient name and admission number first");
      return;
    }
    if (medicines.length === 0 || medicines.some((med) => !med.name)) {
      console.log(
        "❌ Validation failed: No medicines or incomplete medicine data"
      );
      alert("Please add at least one medicine");
      return;
    }

    console.log("✅ Validation passed, opening popup modal");
    setShowPopup(true);
  };

  // Loading state for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for popup modal
  const [showPopup, setShowPopup] = useState(false);
  // State for submit success modal
  const [showSubmitSuccess, setShowSubmitSuccess] = useState(false);

  // State for investigation dropdowns
  const [investigationOptions, setInvestigationOptions] = useState({
    package: [
      "Complete Blood Count (CBC)",
      "Lipid Profile",
      "Liver Function Test (LFT)",
      "Kidney Function Test (KFT)",
      "Thyroid Profile",
      "Diabetes Panel",
      "Cardiac Profile",
      "Basic Metabolic Panel",
    ],
    nonPackage: [
      "X-Ray Chest",
      "ECG",
      "Ultrasound Abdomen",
      "CT Scan Head",
      "MRI Brain",
      "Blood Sugar Random",
      "Hemoglobin",
      "Urine Routine",
      "Stool Examination",
      "ESR",
    ],
  });

  // State for selected investigations
  const [selectedInvestigations, setSelectedInvestigations] = useState({
    package: [],
    nonPackage: [],
  });

  // Package items list (like medicines): [{id, name, quantity}]
  const [packageItems, setPackageItems] = useState([]);
  // Non-Package items list (like medicines): [{id, name, quantity}]
  const [nonPackageItems, setNonPackageItems] = useState([]);

  const removePackageItem = (id) => {
    setPackageItems((prev) => prev.filter((p) => p.id !== id));
  };

  const updatePackageItem = (id, field, value) => {
    setPackageItems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const addInvestigation = () => {
    const newId =
      investigations.length > 0
        ? Math.max(...investigations.map((i) => i.id)) + 1
        : 1;
    setInvestigations([
      ...investigations,
      { id: newId, name: "", quantity: 1 },
    ]);
  };

  const removeInvestigation = (id) => {
    if (investigations.length > 1) {
      setInvestigations(investigations.filter((i) => i.id !== id));
    }
  };

  const updateInvestigation = (id, field, value) => {
    setInvestigations(
      investigations.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    );
  };

  const removeNonPackageItem = (id) => {
    setNonPackageItems((prev) => prev.filter((p) => p.id !== id));
  };

  const updateNonPackageItem = (id, field, value) => {
    setNonPackageItems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  // Generate indent number
  const generateIndentNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `IND-${year}${month}${day}-${random}`;
  };

  const [indentNumber] = useState(generateIndentNumber());

  const addMedicine = () => {
    const newId =
      medicines.length > 0 ? Math.max(...medicines.map((m) => m.id)) + 1 : 1;
    setMedicines([...medicines, { id: newId, name: "", quantity: 1 }]);
  };

  const removeMedicine = (id) => {
    if (medicines.length > 1) {
      setMedicines(medicines.filter((m) => m.id !== id));
    }
  };

  const updateMedicine = (id, field, value) => {
    setMedicines(
      medicines.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  // Keep activeTab in sync with what is available
  useEffect(() => {
    if (requestTypes.medicineSlip) {
      setActiveTab("medicines");
    } else if (
      requestTypes.investigation ||
      requestTypes.package ||
      requestTypes.nonPackage
    ) {
      setActiveTab("investigations");
    }
  }, [requestTypes]);

  const resetForm = () => {
    setFormState({
      admissionNumber: "",
      staffName: "",
      consultantName: "",
      patientName: "",
      uhidNumber: "",
      age: "",
      gender: "",
      wardLocation: "",
      category: "",
      room: "",
      diagnosis: "",
    });
    setMedicines([]);
    setInvestigations([]);
    setRequestTypes({
      medicineSlip: true,
      investigation: false,
      package: false,
      nonPackage: false,
    });
    setActiveTab("medicines");
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    console.log("🚀 Form submission started!", formState);

    // Validate form
    if (!formState.admissionNumber) {
      console.log("❌ Form validation failed: Missing admission number");
      alert("Please enter Admission Number");
      return;
    }
    if (!formState.staffName) {
      console.log("❌ Form validation failed: Missing staff name");
      alert("Please select Staff Name");
      return;
    }
    if (!formState.consultantName) {
      console.log("❌ Form validation failed: Missing consultant name");
      alert("Please select Consultant Name");
      return;
    }
    if (!formState.patientName) {
      console.log("❌ Form validation failed: Missing patient name");
      alert("Please enter Patient Name");
      return;
    }
    if (!formState.uhidNumber) {
      console.log("❌ Form validation failed: Missing UHID number");
      alert("Please enter UHID Number");
      return;
    }
    if (!formState.age) {
      console.log("❌ Form validation failed: Missing age");
      alert("Please enter Age");
      return;
    }
    if (!formState.gender) {
      console.log("❌ Form validation failed: Missing gender");
      alert("Please select Gender");
      return;
    }
    if (!formState.wardLocation) {
      console.log("❌ Form validation failed: Missing ward location");
      alert("Please select Ward Location");
      return;
    }
    if (!formState.category) {
      console.log("❌ Form validation failed: Missing category");
      alert("Please enter Category");
      return;
    }
    if (!formState.room) {
      console.log("❌ Form validation failed: Missing room");
      alert("Please enter Room");
      return;
    }
    if (!formState.diagnosis) {
      console.log("❌ Form validation failed: Missing diagnosis");
      alert("Please enter Diagnosis");
      return;
    }

    // Check if at least one request type is selected
    const hasRequestType = Object.values(requestTypes).some((value) => value);
    if (!hasRequestType) {
      console.log("❌ Form validation failed: No request type selected");
      console.log("Request types:", requestTypes);
      alert("Please select at least one Request Type");
      return;
    }

    // If generic Investigation selected, require investigation selection
    // if (requestTypes.investigation) {
    //   if (!selectedInvestigation) {
    //     console.log("❌ Form validation failed: No investigation selected");
    //     alert("Please select an investigation");
    //     return;
    //   }
    // }

    // Check if at least one primary request type is selected
    const hasPrimaryRequestType =
      requestTypes.medicineSlip || requestTypes.investigation;
    if (!hasPrimaryRequestType) {
      console.log(
        "❌ Form validation failed: No primary request type selected"
      );
      alert("Please select at least Medicine Slip or Investigation");
      return;
    }

    // Check if both primary types are selected (they should be mutually exclusive)
    if (requestTypes.medicineSlip && requestTypes.investigation) {
      console.log(
        "❌ Form validation failed: Cannot select both Medicine Slip and Investigation"
      );
      alert("Please select only one of Medicine Slip or Investigation");
      return;
    }

    // Check if both package types are selected (they should be mutually exclusive)
    if (requestTypes.package && requestTypes.nonPackage) {
      console.log(
        "❌ Form validation failed: Cannot select both Package and Non-Package"
      );
      alert("Please select only one of Package or Non-Package");
      return;
    }

    // if (requestTypes.investigation && !selectedInvestigation) {
    //   console.log("❌ Form validation failed: No investigation selected");
    //   alert("Please select an Investigation");
    //   return;
    // }

    console.log("✅ All form validations passed!");
    console.log("⏳ Starting form submission process...");

    // Set loading state
    setIsSubmitting(true);

    const now = new Date();
    const formattedTimestamp = `${String(now.getDate()).padStart(
      2,
      "0"
    )}/${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}/${now.getFullYear()} ${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

    try {
      // 	Serial Number	Admission No.	Staff Name	Consultant Name	Patient Name	HUID No.	Age	Gender	Diagnosis	Ward Location	Category	Floor Name	Request Type	Medicine Name	Quantity
      // Prepare batch data
      const batchData = {
        timestamp: formattedTimestamp,
        indentNumber: indentNumber, // serial number
        admissionNumber: formState.admissionNumber || "",
        staffName: formState.staffName || "",
        consultantName: formState.consultantName || "",
        patientName: formState.patientName || "",

        uhidNumber: formState.uhidNumber || "",
        age: formState.age || "",
        gender: formState.gender || "",
        diagnosis: formState.diagnosis || "",
        wardLocation: formState.wardLocation || "",
        category: formState.category || "",
        room: formState.room || "",
        requestTypes: requestTypes,
        medicines: requestTypes.medicineSlip ? medicines : [],
        investigations: requestTypes.investigation ? investigations : [],

        // packageItems: packageItems,
        // nonPackageItems: nonPackageItems,
        // selectedInvestigations: selectedInvestigations
      };

      console.log("📝 Batch data to submit:", batchData);

      // Send batch data to Google Sheets using your existing endpoint
      const formData = {
        action: "insertMedicineBatch",
        sheetName: "INDENT",
        batchData: JSON.stringify(batchData),
      };

      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbyfmWBK4ikZUFM5u2nYm9sVG_IlTcNNnR0yI0tCWZmh6VPQVccvV6uxK6eWigljguo4Tg/exec",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams(formData).toString(),
        }
      );

      const result = await response.json();

      if (result.success) {
        console.log("✅ Batch form submitted successfully to Google Sheets!");
        setIsSubmitting(false);
        setShowSubmitSuccess(true);
        resetForm();
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (error) {
      console.error("❌ Error submitting form to Google Sheets:", error);
      setIsSubmitting(false);
      alert("Error submitting form. Please try again.");
    }
  };

  // With this single state:
  const [pharmacyData, setPharmacyData] = useState({});
  const [masterData, setMasterData] = useState({});

  const [selectedInvestigation, setSelectedInvestigation] = useState("");

  // Add these states for selected values
  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedConsultant, setSelectedConsultant] = useState("");
  const [selectedWardLocation, setSelectedWardLocation] = useState("");
  const [selectedAdmitionNumber, setSelectedAdmitionNumber] = useState("");

  const [staffSearch, setStaffSearch] = useState("");
  const [showStaffDropdown, setShowStaffDropdown] = useState(false);

  const [pharmacyLoading, setPharmacyLoading] = useState(false);
  const [pharmacyCurrentPage, setPharmacyCurrentPage] = useState(1);
  const [pharmacyHasMore, setPharmacyHasMore] = useState(true);
  const pharmacyPageSize = 1000; // Number of records per page

  console.log("pharmacyData", pharmacyData);

  const fetchPharmacySheet = useCallback(
    async (page = 1) => {
      console.log("Fetching pharmacy page:", page);

      setPharmacyLoading(true);
      try {
        const response = await fetch(
          `https://script.google.com/macros/s/AKfycbyfmWBK4ikZUFM5u2nYm9sVG_IlTcNNnR0yI0tCWZmh6VPQVccvV6uxK6eWigljguo4Tg/exec?sheet=Admission%20Data&page=${page}&pageSize=${pharmacyPageSize}`
        );
        const result = await response.json();

        console.log("Pharmacy API Response:", result);

        if (result.success && result.data && result.data.length > 0) {
          const headers = result.data[0];
          const newData = {};
          const rowCount = result.data.length - 1; // Number of data rows

          // Initialize each header with empty array of correct size
          headers.forEach((header) => {
            newData[header] = Array(rowCount).fill("");
          });

          // Process each row and column properly
          result.data.slice(1).forEach((row, rowIndex) => {
            headers.forEach((header, colIndex) => {
              if (colIndex < row.length) {
                const value = row[colIndex];
                if (value !== null && value !== undefined) {
                  const stringValue = String(value).trim();
                  newData[header][rowIndex] = stringValue;
                }
                // else remains as empty string (already filled)
              }
              // else remains as empty string (already filled)
            });
          });

          console.log("Processed new data with equal array sizes:", newData);

          // Merge with existing data
          setPharmacyData((prevData) => {
            // If first page, replace all data
            if (page === 1) {
              return newData;
            }

            // For subsequent pages, merge with existing data
            const mergedData = { ...prevData };

            Object.keys(newData).forEach((key) => {
              if (mergedData[key]) {
                mergedData[key] = [...mergedData[key], ...newData[key]];
              } else {
                mergedData[key] = newData[key];
              }
            });

            return mergedData;
          });

          // Check if there's more data to load
          setPharmacyHasMore(result.pagination?.hasMore || false);
        }
      } catch (error) {
        console.error("Error fetching pharmacy data:", error);
      } finally {
        setPharmacyLoading(false);
      }
    },
    [pharmacyPageSize]
  );
  const handlePharmacyScroll = useCallback(() => {
    if (pharmacyLoading || !pharmacyHasMore) return;

    const scrollTop =
      document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight =
      document.documentElement.scrollHeight || document.body.scrollHeight;
    const clientHeight =
      document.documentElement.clientHeight || window.innerHeight;

    // Load more data when user is near the bottom
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      setPharmacyCurrentPage((prevPage) => {
        const nextPage = prevPage + 1;
        fetchPharmacySheet(nextPage);
        return nextPage;
      });
    }
  }, [pharmacyLoading, pharmacyHasMore, fetchPharmacySheet]);

  // Initial pharmacy data load
  useEffect(() => {
    fetchPharmacySheet(1);
  }, [fetchPharmacySheet]);

  // Add scroll event listener for pharmacy data
  useEffect(() => {
    window.addEventListener("scroll", handlePharmacyScroll);
    return () => window.removeEventListener("scroll", handlePharmacyScroll);
  }, [handlePharmacyScroll]);

  const [ladingMaster, setLoadingMaster] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 1000; // Number of records per page

  const fetchMasterSheet = useCallback(
    async (page = 1) => {
      console.log("Fetching page:", page);

      setLoadingMaster(true);
      try {
        const response = await fetch(
          `https://script.google.com/macros/s/AKfycbx_ffGXIZelQ3qCR_QuWT1hhQ3UZwjUjgl4Gnb3GpxcAHuUj206Kw3iGZV_qfCmmKk/exec?sheet=Pharmacy's%20Details&page=${page}&pageSize=${pageSize}`
        );
        const result = await response.json();

        console.log("API Response:", result);

        if (result.success && result.data && result.data.length > 0) {
          const headers = result.data[0];
          const newData = {};

          // Initialize each header with empty array
          headers.forEach((header) => {
            newData[header] = [];
          });

          // Process data rows (skip header row)
          result.data.slice(1).forEach((row) => {
            row.forEach((value, index) => {
              const header = headers[index];
              if (value !== null && value !== undefined) {
                const stringValue = String(value).trim();
                if (stringValue !== "") {
                  newData[header].push(stringValue);
                }
              }
            });
          });

          // Remove duplicates and merge with existing data
          setMasterData((prevData) => {
            const mergedData = { ...prevData };

            Object.keys(newData).forEach((key) => {
              if (mergedData[key]) {
                // Merge and remove duplicates
                const combined = [...mergedData[key], ...newData[key]];
                mergedData[key] = [...new Set(combined)];
              } else {
                mergedData[key] = newData[key];
              }
            });

            return mergedData;
          });

          // Check if there's more data to load
          setHasMore(result.pagination?.hasMore || false);
        }
      } catch (error) {
        console.error("Error fetching master data:", error);
      } finally {
        setLoadingMaster(false);
      }
    },
    [pageSize]
  );

  // Load more data when scrolling
  const handleScroll = useCallback(() => {
    if (ladingMaster || !hasMore) return;

    const scrollTop =
      document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight =
      document.documentElement.scrollHeight || document.body.scrollHeight;
    const clientHeight =
      document.documentElement.clientHeight || window.innerHeight;

    // Load more data when user is near the bottom
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      setCurrentPage((prevPage) => {
        const nextPage = prevPage + 1;
        fetchMasterSheet(nextPage);
        return nextPage;
      });
    }
  }, [ladingMaster, hasMore, fetchMasterSheet]);

  // Initial data load
  useEffect(() => {
    fetchMasterSheet(1);
  }, [fetchMasterSheet]);

  // Add scroll event listener
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    fetchPharmacySheet();
  }, []);

  const findPatientByAdmissionNumber = (admissionNumber) => {
    // This assumes your master data has a structure where all arrays are aligned by index
    // You might need to adjust this based on your actual data structure

    const admissionIndex =
      pharmacyData["Registration Number"]?.indexOf(admissionNumber);

    if (admissionIndex === -1 || admissionIndex === undefined) {
      return null;
    }

    return {
      patientName: pharmacyData["Patient Name"]?.[admissionIndex] || "",
      age: pharmacyData["Age"]?.[admissionIndex] || "",
      gender: pharmacyData["Gender"]?.[admissionIndex] || "",
      wardLocation: pharmacyData["Ward No."]?.[admissionIndex] || "",
      category: pharmacyData["Pat.Category"]?.[admissionIndex] || "",
      room: pharmacyData["Location"]?.[admissionIndex] || "",
      diagnosis: pharmacyData["Admission Purpose"]?.[admissionIndex] || "",
    };
  };

  const handleGlobalAdmitionNumber = (admissionNumber) => {
    setFormState({ ...formState, admissionNumber: admissionNumber });
    setSelectedAdmitionNumber(admissionNumber);

    // Populate other fields based on admission number
    const patientData = findPatientByAdmissionNumber(admissionNumber);
    if (patientData) {
      setFormState((prevState) => ({
        ...prevState,
        patientName: patientData.patientName,
        age: patientData.age,
        gender: patientData.gender,
        wardLocation: patientData.wardLocation,
        category: patientData.category,
        room: patientData.room,
        diagnosis: patientData.diagnosis,
        admissionNumber: admissionNumber, // Keep this to ensure it's set correctly
      }));

      // Also update the selected values for dropdowns
      setSelectedWardLocation(patientData.wardLocation);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-300/10 to-blue-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header - Modern & Smaller */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-700 text-white py-8 shadow-xl relative overflow-hidden">
        {/* Header Background Pattern - Modern Glass Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/40 via-purple-600/40 to-indigo-700/40 backdrop-blur-sm"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent"></div>
        </div>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg backdrop-blur-md shadow-lg">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1v-2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent drop-shadow-md">
                  Patient Indent Form
                </h1>
                <p className="text-sm text-blue-100 font-medium"></p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-3">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
              <div className="w-1.5 h-1.5 bg-blue-200 rounded-full animate-pulse delay-100"></div>
              <div className="w-1.5 h-1.5 bg-purple-200 rounded-full animate-pulse delay-200"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Form - Modern Design */}
      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <form onSubmit={handleSubmit}>
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/60 p-6 md:p-8 relative overflow-hidden">
            {/* Form Background Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-100/50 to-pink-100/50 rounded-full blur-2xl"></div>
            {/* Patient Information Section - Modern */}
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full mr-3"></div>
                <h2 className="text-lg font-bold text-gray-800 flex items-center">
                  <span>Patient Information</span>
                  <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                    Required
                  </span>
                </h2>
              </div>

              {/* First Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="group">
                  <label
                    htmlFor="admissionNumber"
                    className="block text-sm font-semibold text-gray-700 mb-3"
                  >
                    Admission Number <span className="text-rose-500">*</span>
                  </label>

                  <CustomSelect
                    placeholder="Search or select admission number..."
                    value={selectedAdmitionNumber || undefined}
                    loader={pharmacyLoading}
                    onChange={handleGlobalAdmitionNumber}
                    options={pharmacyData["Registration Number"] || []}
                    className="w-full"
                    pageSize={1000}
                  />
                </div>
                <div className="group">
                  <label
                    htmlFor="staffName"
                    className="block text-sm font-semibold text-gray-700 mb-3"
                  >
                    Staff Name <span className="text-rose-500">*</span>
                  </label>

                  <CustomSelect
                    placeholder="Search or select staff..."
                    value={selectedStaff || undefined}
                    loader={ladingMaster}
                    onChange={(selectedStaff) => {
                      setSelectedStaff(selectedStaff);
                      setFormState({ ...formState, staffName: selectedStaff });
                    }}
                    options={masterData["Staff Name"] || []}
                    className="w-full"
                    pageSize={1000} // Add this prop
                  />
                </div>
                <div className="group">
                  <label
                    htmlFor="consultantName"
                    className="block text-sm font-semibold text-gray-700 mb-3"
                  >
                    Consultant Name <span className="text-rose-500">*</span>
                  </label>

                  <CustomSelect
                    placeholder="Search or select consultant..."
                    value={selectedConsultant || undefined}
                    loader={ladingMaster}
                    onChange={(selectedConsultant) => {
                      setFormState({
                        ...formState,
                        consultantName: selectedConsultant,
                      });
                      setSelectedConsultant(selectedConsultant);
                    }}
                    options={masterData["Consultant Name"] || []}
                    className="w-full"
                    pageSize={1000} // Add this prop
                  />
                </div>

                <div className="group">
                  <label
                    htmlFor="patientName"
                    className="block text-sm font-semibold text-gray-700 mb-3"
                  >
                    Patient Name <span className="text-rose-500">*</span>
                  </label>

                  <input
                    type="text"
                    id="patientName"
                    name="patientName"
                    value={formState.patientName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-300/50 focus:border-orange-500 transition-all duration-300 font-medium shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                  />
                </div>
              </div>

              {/* Second Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="group">
                  <label
                    htmlFor="uhidNumber"
                    className="block text-sm font-semibold text-gray-700 mb-3"
                  >
                    UHID No. <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="uhidNumber"
                    name="uhidNumber"
                    value={formState.uhidNumber}
                    onChange={handleInputChange}
                    placeholder="Enter UHID Number"
                    className="w-full px-4 py-3 bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-cyan-200 focus:border-cyan-400 transition-all duration-300 placeholder-gray-400 font-medium"
                  />
                </div>
                <div className="group">
                  <label
                    htmlFor="age"
                    className="block text-sm font-semibold text-gray-700 mb-3"
                  >
                    Age <span className="text-rose-500">*</span>
                  </label>

                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={formState.age}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gradient-to-r from-teal-50 to-green-50 border-2 border-teal-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-200 focus:border-teal-400 transition-all duration-300 font-medium"
                  />
                </div>
                <div className="group">
                  <label
                    htmlFor="gender"
                    className="block text-sm font-semibold text-gray-700 mb-3"
                  >
                    Gender <span className="text-rose-500">*</span>
                  </label>

                  <select
                    id="gender"
                    name="gender"
                    value={formState.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gradient-to-r from-pink-50 to-rose-50 border-2 border-pink-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-pink-200 focus:border-pink-400 transition-all duration-300 font-medium"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="group">
                  <label
                    htmlFor="wardLocation"
                    className="block text-sm font-semibold text-gray-700 mb-3"
                  >
                    Ward Location <span className="text-rose-500">*</span>
                  </label>

                  <CustomSelect
                    placeholder="Search or select ward location..."
                    value={selectedWardLocation || undefined}
                    loader={pharmacyLoading}
                    onChange={(selectedWardLocation) => {
                      setFormState({
                        ...formState,
                        wardLocation: selectedWardLocation,
                      });
                      setSelectedWardLocation(selectedWardLocation);
                    }}
                    options={pharmacyData["Ward No."] || []}
                    className="w-full"
                    pageSize={1000}
                  />
                </div>
              </div>

              {/* Third Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="group">
                  <label
                    htmlFor="category"
                    className="block text-sm font-semibold text-gray-700 mb-3"
                  >
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="category"
                      name="category"
                      value={formState.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gradient-to-r from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-400 transition-all duration-300 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormState({ ...formState, category: "" })
                      }
                      className="absolute right-3 top-3 text-gray-400 hover:text-rose-500 transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="group">
                  <label
                    htmlFor="room"
                    className="block text-sm font-semibold text-gray-700 mb-3"
                  >
                    Room <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="room"
                    name="room"
                    value={formState.room}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 transition-all duration-300 font-medium"
                  />
                </div>

                <div className="group">
                  <label
                    htmlFor="diagnosis"
                    className="block text-sm font-semibold text-gray-700 mb-3"
                  >
                    Diagnosis <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="diagnosis"
                    name="diagnosis"
                    value={formState.diagnosis}
                    onChange={handleInputChange}
                    placeholder="Enter Diagnosis"
                    className="w-full px-4 py-3 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-200 focus:border-amber-400 transition-all duration-300 placeholder-gray-400 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Request Type Section - Modern */}
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full mr-3"></div>
                <h2 className="text-lg font-bold text-gray-800 flex items-center">
                  <span>Request Type</span>
                  <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    Select One
                  </span>
                </h2>
              </div>
              <div className="bg-gradient-to-r from-blue-50/70 via-purple-50/70 to-pink-50/70 rounded-xl p-4 border border-blue-100 shadow-md hover:shadow-lg transition-all duration-300">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="flex items-center group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        id="medicine-slip"
                        checked={requestTypes.medicineSlip}
                        onChange={() => handleCheckboxChange("medicineSlip")}
                        className="sr-only"
                      />
                      <label
                        htmlFor="medicine-slip"
                        className="flex items-center cursor-pointer"
                      >
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center mr-3 shadow-lg transition-all duration-300 ${
                            requestTypes.medicineSlip
                              ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                              : "bg-gray-200"
                          }`}
                        >
                          <svg
                            className={`w-4 h-4 text-white ${
                              requestTypes.medicineSlip
                                ? "opacity-100"
                                : "opacity-0"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span
                          className={`text-sm font-semibold ${
                            requestTypes.medicineSlip
                              ? "text-blue-700"
                              : "text-gray-700"
                          }`}
                        >
                          Medicine Slip
                        </span>
                      </label>
                    </div>
                  </div>
                  <div className="flex items-center group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        id="investigation"
                        checked={requestTypes.investigation}
                        onChange={() => handleCheckboxChange("investigation")}
                        className="sr-only"
                      />
                      <label
                        htmlFor="investigation"
                        className="flex items-center cursor-pointer"
                      >
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center mr-3 shadow-lg transition-all duration-300 ${
                            requestTypes.investigation
                              ? "bg-gradient-to-r from-green-500 to-emerald-500"
                              : "bg-gray-200"
                          }`}
                        >
                          <svg
                            className={`w-4 h-4 text-white ${
                              requestTypes.investigation
                                ? "opacity-100"
                                : "opacity-0"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span
                          className={`text-sm font-semibold ${
                            requestTypes.investigation
                              ? "text-green-700"
                              : "text-gray-700"
                          }`}
                        >
                          Investigation
                        </span>
                      </label>
                    </div>
                  </div>
                  <div className="flex items-center group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        id="package"
                        checked={requestTypes.package}
                        onChange={() => handleCheckboxChange("package")}
                        className="sr-only"
                      />
                      <label
                        htmlFor="package"
                        className="flex items-center cursor-pointer"
                      >
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center mr-3 shadow-lg transition-all duration-300 ${
                            requestTypes.package
                              ? "bg-gradient-to-r from-purple-500 to-pink-500"
                              : "bg-gray-200"
                          }`}
                        >
                          <svg
                            className={`w-4 h-4 text-white ${
                              requestTypes.package ? "opacity-100" : "opacity-0"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span
                          className={`text-sm font-semibold ${
                            requestTypes.package
                              ? "text-purple-700"
                              : "text-gray-700"
                          }`}
                        >
                          Package
                        </span>
                      </label>
                    </div>
                  </div>
                  <div className="flex items-center group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        id="non-package"
                        checked={requestTypes.nonPackage}
                        onChange={() => handleCheckboxChange("nonPackage")}
                        className="sr-only"
                      />
                      <label
                        htmlFor="non-package"
                        className="flex items-center cursor-pointer"
                      >
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center mr-3 shadow-lg transition-all duration-300 ${
                            requestTypes.nonPackage
                              ? "bg-gradient-to-r from-orange-500 to-red-500"
                              : "bg-gray-200"
                          }`}
                        >
                          <svg
                            className={`w-4 h-4 text-white ${
                              requestTypes.nonPackage
                                ? "opacity-100"
                                : "opacity-0"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span
                          className={`text-sm font-semibold ${
                            requestTypes.nonPackage
                              ? "text-orange-700"
                              : "text-gray-700"
                          }`}
                        >
                          Non Package
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs header for switching content area */}
              {(hasMedicines || hasInvestigations) && (
                <div className="mt-4 border-b border-gray-200 flex space-x-2">
                  {hasMedicines && (
                    <button
                      type="button"
                      onClick={() => setActiveTab("medicines")}
                      className={`px-3 py-2 text-sm font-semibold rounded-t-md border-b-2 transition-colors ${
                        activeTab === "medicines"
                          ? "border-emerald-500 text-emerald-700"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Medicines
                    </button>
                  )}
                  {hasInvestigations && (
                    <button
                      type="button"
                      onClick={() => setActiveTab("investigations")}
                      className={`px-3 py-2 text-sm font-semibold rounded-t-md border-b-2 transition-colors ${
                        activeTab === "investigations"
                          ? "border-purple-500 text-purple-700"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Investigations
                    </button>
                  )}
                </div>
              )}

              {activeTab === "investigations" && requestTypes.investigation && (
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                      <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full mr-3"></div>
                      <h2 className="text-lg font-bold text-gray-800 flex items-center">
                        <span>Investigations</span>
                        <span className="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                          {investigations.length} Items
                        </span>
                      </h2>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {investigations.map((investigation, index) => (
                      <div
                        key={investigation.id}
                        className="bg-gradient-to-r from-gray-50/80 to-blue-50/80 rounded-lg p-3 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                          <div className="md:col-span-8">
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Investigation Name{" "}
                              <span className="text-rose-500">*</span>
                            </label>

                            <CustomSelect
                              placeholder="Search or select investigation..."
                              value={investigation.name || undefined}
                              loader={ladingMaster}
                              onChange={(selectedValue) =>
                                updateInvestigation(
                                  investigation.id,
                                  "name",
                                  selectedValue
                                )
                              }
                              options={masterData["Investigation Name"] || []}
                              className="w-full"
                              pageSize={1000} // Add this prop
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Quantity <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={investigation.quantity}
                              onChange={(e) =>
                                updateInvestigation(
                                  investigation.id,
                                  "quantity",
                                  parseInt(e.target.value) || 1
                                )
                              }
                              className="w-full px-3 py-2 bg-white border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all duration-200 text-center text-sm font-medium shadow-sm"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <button
                              onClick={() =>
                                removeInvestigation(investigation.id)
                              }
                              className="w-full bg-gradient-to-r from-rose-400 to-red-400 hover:from-rose-500 hover:to-red-500 text-white px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 flex items-center justify-center space-x-1 focus:outline-none focus:ring-2 focus:ring-rose-300"
                            >
                              <svg
                                className="w-3 h-3"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                              </svg>
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Investigation Button - Moved to bottom */}
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={addInvestigation}
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 shadow-sm hover:shadow-md flex items-center space-x-1 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Add Investigation</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Package Items Section - only when Package is selected */}
              {activeTab === "investigations" && requestTypes.package && (
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                      <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full mr-3"></div>
                      <h2 className="text-lg font-bold text-gray-800 flex items-center">
                        <span>Package Items</span>
                        <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                          {packageItems.length} Items
                        </span>
                      </h2>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {packageItems.map((pkg) => (
                      <div
                        key={pkg.id}
                        className="bg-gradient-to-r from-gray-50/80 to-purple-50/80 rounded-lg p-3 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                          <div className="md:col-span-8">
                            <label
                              htmlFor={`package-name-${pkg.id}`}
                              className="block text-xs font-medium text-gray-600 mb-1"
                            >
                              Package Name{" "}
                              <span className="text-rose-500">*</span>
                            </label>
                            <select
                              id={`package-name-${pkg.id}`}
                              name={`packageName-${pkg.id}`}
                              className="w-full px-3 py-2 bg-white border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all duration-200 text-gray-600 text-sm shadow-sm"
                              value={pkg.name}
                              onChange={(e) =>
                                updatePackageItem(
                                  pkg.id,
                                  "name",
                                  e.target.value
                                )
                              }
                            >
                              <option value="">
                                Search and select package...
                              </option>
                              {investigationOptions.package.map(
                                (option, index) => (
                                  <option key={index} value={option}>
                                    {option}
                                  </option>
                                )
                              )}
                            </select>
                          </div>
                          <div className="md:col-span-2">
                            <label
                              htmlFor={`package-qty-${pkg.id}`}
                              className="block text-xs font-medium text-gray-600 mb-1"
                            >
                              Quantity <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="number"
                              min="1"
                              id={`package-qty-${pkg.id}`}
                              name={`packageQty-${pkg.id}`}
                              value={pkg.quantity}
                              onChange={(e) =>
                                updatePackageItem(
                                  pkg.id,
                                  "quantity",
                                  parseInt(e.target.value) || 1
                                )
                              }
                              className="w-full px-3 py-2 bg-white border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all duration-200 text-center text-sm font-medium shadow-sm"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <button
                              onClick={() => removePackageItem(pkg.id)}
                              className="w-full bg-gradient-to-r from-rose-400 to-red-400 hover:from-rose-500 hover:to-red-500 text-white px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 flex items-center justify-center space-x-1 focus:outline-none focus:ring-2 focus:ring-rose-300"
                            >
                              <svg
                                className="w-3 h-3"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                              </svg>
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Non-Package Items Section - only when Non-Package is selected */}
              {activeTab === "investigations" && requestTypes.nonPackage && (
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                      <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-red-500 rounded-full mr-3"></div>
                      <h2 className="text-lg font-bold text-gray-800 flex items-center">
                        <span>Non-Package Items</span>
                        <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                          {nonPackageItems.length} Items
                        </span>
                      </h2>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {nonPackageItems.map((np) => (
                      <div
                        key={np.id}
                        className="bg-gradient-to-r from-gray-50/80 to-orange-50/80 rounded-lg p-3 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                          <div className="md:col-span-8">
                            <label
                              htmlFor={`nonpackage-name-${np.id}`}
                              className="block text-xs font-medium text-gray-600 mb-1"
                            >
                              Non-Package Name{" "}
                              <span className="text-rose-500">*</span>
                            </label>
                            <select
                              id={`nonpackage-name-${np.id}`}
                              name={`nonpackageName-${np.id}`}
                              className="w-full px-3 py-2 bg-white border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all duration-200 text-gray-600 text-sm shadow-sm"
                              value={np.name}
                              onChange={(e) =>
                                updateNonPackageItem(
                                  np.id,
                                  "name",
                                  e.target.value
                                )
                              }
                            >
                              <option value="">
                                Search and select investigation...
                              </option>
                              {investigationOptions.nonPackage.map(
                                (option, index) => (
                                  <option key={index} value={option}>
                                    {option}
                                  </option>
                                )
                              )}
                            </select>
                          </div>
                          <div className="md:col-span-2">
                            <label
                              htmlFor={`nonpackage-qty-${np.id}`}
                              className="block text-xs font-medium text-gray-600 mb-1"
                            >
                              Quantity <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="number"
                              min="1"
                              id={`nonpackage-qty-${np.id}`}
                              name={`nonpackageQty-${np.id}`}
                              value={np.quantity}
                              onChange={(e) =>
                                updateNonPackageItem(
                                  np.id,
                                  "quantity",
                                  parseInt(e.target.value) || 1
                                )
                              }
                              className="w-full px-3 py-2 bg-white border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all duration-200 text-center text-sm font-medium shadow-sm"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <button
                              onClick={() => removeNonPackageItem(np.id)}
                              className="w-full bg-gradient-to-r from-rose-400 to-red-400 hover:from-rose-500 hover:to-red-500 text-white px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 flex items-center justify-center space-x-1 focus:outline-none focus:ring-2 focus:ring-rose-300"
                            >
                              <svg
                                className="w-3 h-3"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                              </svg>
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Investigation Dropdowns removed as requested */}
            </div>

            {/* Medicines Section - Modern (visible only when Medicine Slip is selected) */}
            {requestTypes.medicineSlip && activeTab === "medicines" && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full mr-3"></div>
                    <h2 className="text-lg font-bold text-gray-800 flex items-center">
                      <span>Medicines</span>
                      <span className="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                        {medicines.length} Items
                      </span>
                    </h2>
                  </div>
                </div>

                <div className="space-y-3">
                  {medicines.map((medicine, index) => (
                    <div
                      key={medicine.id}
                      className="bg-gradient-to-r from-gray-50/80 to-blue-50/80 rounded-lg p-3 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                        <div className="md:col-span-8">
                          <label
                            htmlFor={`medicine-name-${medicine.id}`}
                            className="block text-xs font-medium text-gray-600 mb-1"
                          >
                            Medicine Name{" "}
                            <span className="text-rose-500">*</span>
                          </label>

                          <CustomSelect
                            placeholder="Search or select medicine..."
                            value={medicine.name || undefined}
                            loader={ladingMaster}
                            onChange={(selectedValue) =>
                              updateMedicine(medicine.id, "name", selectedValue)
                            }
                            options={masterData["Medicine Name"] || []}
                            className="w-full"
                            pageSize={1000} // Add this prop
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label
                            htmlFor={`medicine-qty-${medicine.id}`}
                            className="block text-xs font-medium text-gray-600 mb-1"
                          >
                            Quantity <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="number"
                            min="1"
                            id={`medicine-qty-${medicine.id}`}
                            name={`medicineQty-${medicine.id}`}
                            value={medicine.quantity}
                            onChange={(e) =>
                              updateMedicine(
                                medicine.id,
                                "quantity",
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="w-full px-3 py-2 bg-white border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all duration-200 text-center text-sm font-medium shadow-sm"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <button
                            onClick={() => removeMedicine(medicine.id)}
                            className="w-full bg-gradient-to-r from-rose-400 to-red-400 hover:from-rose-500 hover:to-red-500 text-white px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 flex items-center justify-center space-x-1 focus:outline-none focus:ring-2 focus:ring-rose-300"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                            </svg>
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Medicine Button - Moved to bottom */}
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={addMedicine}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 shadow-sm hover:shadow-md flex items-center space-x-1 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Add Medicine</span>
                  </button>
                </div>

                {/* Medicines Order Summary */}
                {medicines.length > 0 && (
                  <div className="mt-5 bg-emerald-50 border border-emerald-200 rounded-lg overflow-hidden">
                    <div className="px-4 py-2 bg-emerald-100 border-b border-emerald-200">
                      <h3 className="text-sm font-semibold text-emerald-900">
                        Order Summary
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm text-gray-700">
                        <thead>
                          <tr className="bg-emerald-900 text-white">
                            <th className="px-3 py-2 text-left w-16">Sl. No</th>
                            <th className="px-3 py-2 text-left">
                              Medicine Name
                            </th>
                            <th className="px-3 py-2 text-right w-28">
                              Quantity
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {medicines.map((m, idx) => (
                            <tr
                              key={m.id}
                              className="odd:bg-emerald-50 even:bg-white"
                            >
                              <td className="px-3 py-2">{idx + 1}</td>
                              <td className="px-3 py-2">{m.name || "-"}</td>
                              <td className="px-3 py-2 text-right">
                                {m.quantity || 0}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-emerald-100 border-t border-emerald-200 font-semibold">
                            <td className="px-3 py-2" colSpan={2}>
                              Total Items: {medicines.length}
                            </td>
                            <td className="px-3 py-2 text-right">
                              Total Quantity:{" "}
                              {medicines.reduce(
                                (sum, m) => sum + (parseInt(m.quantity) || 0),
                                0
                              )}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Submit Button - Modern */}
            <div className="text-center mt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`bg-gradient-to-r ${
                  isSubmitting
                    ? "from-gray-400 via-gray-500 to-gray-400"
                    : "from-indigo-500 via-purple-500 to-blue-500 hover:from-indigo-600 hover:via-purple-600 hover:to-blue-600"
                } text-white px-8 py-3 rounded-lg text-sm font-semibold transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center space-x-2 mx-auto relative overflow-hidden group`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin w-4 h-4 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span className="relative z-10">Processing...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="relative z-10">Submit Indent</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Footer - Modern */}
      <div className="bg-gradient-to-r from-indigo-800 via-purple-800 to-blue-800 text-white py-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/10 via-purple-600/10 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg flex items-center justify-center shadow-lg">
              <svg
                className="w-3 h-3 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-sm text-gray-300">Powered by</span>
            <a
              href="https://www.botivate.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-transparent bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text font-bold text-base hover:from-blue-200 hover:via-purple-200 hover:to-pink-200 transition-all duration-300 cursor-pointer"
            >
              Botivate
            </a>
          </div>
          <div className="flex items-center justify-center space-x-1">
            <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"></div>
            <div className="w-1 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse delay-300"></div>
            <div className="w-1.5 h-1.5 bg-gradient-to-r from-pink-400 to-blue-400 rounded-full animate-pulse delay-700"></div>
          </div>
        </div>
      </div>

      {/* Medicine Button - Fixed Bottom Right */}
      <button
        onClick={handleMedicineButtonClick}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-emerald-300 z-50"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-2.019 1 1 0 01-.285-1.05l1.715-5.349L11 5.477V16a1 1 0 11-2 0V5.477L6.237 6.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-2.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Patient Indent Summary</h2>
                <button
                  onClick={() => setShowPopup(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Patient Info Card */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4">
                      Patient Information
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-600">
                          Indent No:
                        </span>
                        <span className="font-bold text-indigo-600">
                          {indentNumber}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-600">
                          Patient Name:
                        </span>
                        <span className="font-bold text-gray-800">
                          {formState.patientName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-600">
                          Admission No:
                        </span>
                        <span className="font-bold text-gray-800">
                          {formState.admissionNumber}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-600">
                          UHID:
                        </span>
                        <span className="font-bold text-gray-800">
                          {formState.uhidNumber}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4">
                      Additional Details
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-600">
                          Age:
                        </span>
                        <span className="font-bold text-gray-800">
                          {formState.age}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-600">
                          Gender:
                        </span>
                        <span className="font-bold text-gray-800">
                          {formState.gender}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-600">
                          Ward:
                        </span>
                        <span className="font-bold text-gray-800">
                          {formState.wardLocation}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-600">
                          Room:
                        </span>
                        <span className="font-bold text-gray-800">
                          {formState.room}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Medicines Card removed from popup as requested */}

              {/* Investigations Card - removed as requested */}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowPopup(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    console.log("🎯 Submit Indent button clicked from popup!");
                    console.log("📊 Final submission data:", {
                      indentNumber,
                      formState,
                      medicines: medicines.filter((med) => med.name),
                      selectedInvestigations,
                      requestTypes,
                    });
                    alert("Indent submitted successfully!");
                    console.log("✅ Indent submission completed!");
                    setShowPopup(false);
                  }}
                  className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-300"
                >
                  Submit Indent
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Success Modal */}
      {showSubmitSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-5 rounded-t-2xl">
              <h3 className="text-xl font-bold">Form Submitted</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-3">
                Your indent has been submitted successfully.
              </p>
              <div className="text-sm text-gray-600 space-y-1 mb-4">
                <div>
                  <span className="font-semibold">Indent No:</span>{" "}
                  {indentNumber}
                </div>
                <div>
                  <span className="font-semibold">Patient:</span>{" "}
                  {formState.patientName}
                </div>
                <div>
                  <span className="font-semibold">Admission No:</span>{" "}
                  {formState.admissionNumber}
                </div>
              </div>
              {/* Medicines list removed from success modal as requested */}
              {/* Investigations summary removed as requested */}
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    console.log("✅ Success modal closed");
                    setShowSubmitSuccess(false);
                  }}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
