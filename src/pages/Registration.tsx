import React, { useState, useEffect } from 'react';
import { Calendar, Check, User, Clock, Building, Phone, Mail, MapPin, ArrowLeft, Activity, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DatabaseService, CompleteRegistrationData } from '../lib/supabase';
import { getCurrentISTDate, istDateToUTCStart } from '../lib/dateUtils';

const Registration: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(getCurrentISTDate());
  const [registrationType, setRegistrationType] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<any>(null);
  const [availableRooms, setAvailableRooms] = useState<string[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  useEffect(() => {
    if (registrationType === 'IP') {
      loadAvailableRooms();
    } else {
      setAvailableRooms([]);
      if (patientDetails.roomNumber) {
        handlePatientDetailChange('roomNumber', '');
      }
    }
  }, [registrationType]);

  const loadAvailableRooms = async () => {
    setLoadingRooms(true);
    try {
      const rooms = await DatabaseService.getAvailableRooms();
      setAvailableRooms(rooms);
    } catch (error) {
      console.error('Error loading available rooms:', error);
      alert('Failed to load available rooms. Please try again.');
    } finally {
      setLoadingRooms(false);
    }
  };

  // Get current IST time for default values
  const getCurrentISTTime = () => {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(now.getTime() + istOffset);
    return istTime.toISOString().slice(11, 16); // HH:MM format
  };

  // Patient details form state
  const [patientDetails, setPatientDetails] = useState({
    fullName: '',
    contactNumber: '',
    age: '',
    dateOfBirth: '',
    email: '',
    bloodGroup: '',
    gender: '',
    address: '',
    timestamp: new Date().toISOString(),
    // Payment fields
    paymentMethod: '',
    paymentAmount: '',
    // Initial Vital Signs (optional)
    bloodPressure: '',
    heartRate: '',
    temperature: '',
    weight: '',
    // IP-specific fields
    guardianName: '',
    guardianRelationship: '',
    admissionDate: getCurrentISTDate(),
    admissionTime: getCurrentISTTime(),
    admissionType: '',
    ipDepartment: '',
    roomNumber: '',
    // OP-specific fields
    appointmentTime: getCurrentISTTime(),
    consultationType: '',
    symptoms: '',
    referredBy: ''
  });

  const doctors = [
    {
      id: '98a78477-ae6a-41c4-8938-a10cd129b112',
      name: 'Dr. G Sridhar',
      title: 'Senior Consultant in Pediatrics',
      specialization: 'Pediatrics',
      experience: '15+ years',
      avatar: 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2&fit=crop',
      availability: 'Available Today'
    },
    {
      id: '95b573b2-17a6-4f9c-bc56-668ac5922f02',
      name: 'Dr. Himabindu Sridhar',
      title: 'Consultant Dermatologist, Cosmetologist, Laser & Hair Transplant Surgeon',
      specialization: 'Dermatology & Cosmetology',
      experience: '12+ years',
      avatar: 'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2&fit=crop',
      availability: 'Available Today'
    }
  ];

  const registrationTypes = [
    {
      id: 'OP',
      name: 'Outpatient (OP)',
      description: 'For consultations, check-ups, day procedures',
      icon: User,
      features: ['Same-day consultation', 'Diagnostic tests', 'Minor procedures', 'Follow-up visits'],
      color: 'blue'
    },
    {
      id: 'IP',
      name: 'Inpatient (IP)',
      description: 'For admission and overnight stay',
      icon: Building,
      features: ['Hospital admission', 'Overnight stay', 'Surgery procedures', '24/7 monitoring'],
      color: 'green'
    }
  ];

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const bloodGroupOptions = ['None', ...bloodGroups];
  const genders = ['Male', 'Female', 'Other'];
  
  // IP-specific options following Indian medical standards
  const guardianRelationships = [
    'Father', 'Mother', 'Spouse', 'Son', 'Daughter', 'Brother', 'Sister',
    'Uncle', 'Aunt', 'Grandfather', 'Grandmother', 'Guardian', 'Other'
  ];
  
  const admissionTypes = [
    'General Ward', 'Private Room', 'ICU', 'Emergency'
  ];
  
  const ipDepartments = [
    'Pediatrics', 'Dermatology'
  ];
  
  // OP-specific options
  const consultationTypes = [
    'Regular Consultation', 'Follow-up', 'Emergency', 'Specialist Consultation'
  ];
  
  const priorities = [
    'Low', 'Normal', 'High', 'Urgent'
  ];

  const paymentMethods = ['Cash', 'UPI'];

  const isStep1to3Valid = selectedDoctor && selectedDate && registrationType;
  const isPatientDetailsValid = patientDetails.fullName &&
                                patientDetails.contactNumber &&
                                patientDetails.age &&
                                patientDetails.bloodGroup &&
                                patientDetails.gender &&
                                patientDetails.address &&
                                // Additional validation for IP patients
                                (registrationType !== 'IP' || (
                                  patientDetails.guardianName &&
                                  patientDetails.guardianRelationship &&
                                  patientDetails.admissionDate &&
                                  patientDetails.admissionTime &&
                                  patientDetails.admissionType &&
                                  patientDetails.ipDepartment &&
                                  patientDetails.roomNumber
                                )) &&
                                // Additional validation for OP patients
                                (registrationType !== 'OP' || (
                                  patientDetails.appointmentTime &&
                                  patientDetails.consultationType
                                ));
  const isFormComplete = isStep1to3Valid && isPatientDetailsValid;

  const handlePatientDetailChange = (field: string, value: string) => {
    setPatientDetails(prev => ({
      ...prev,
      [field]: value,
      timestamp: new Date().toISOString() // Update timestamp on any change
    }));
  };

  const handleContactNumberChange = (value: string) => {
    // Only allow numeric input
    const numericValue = value.replace(/[^0-9]/g, '');
    handlePatientDetailChange('contactNumber', numericValue);
  };

  const handleAgeChange = (value: string) => {
    // Only allow numeric input
    const numericValue = value.replace(/[^0-9]/g, '');
    handlePatientDetailChange('age', numericValue);
  };

  const handleRegisterPatient = async () => {
    if (isFormComplete) {
      setIsSubmitting(true);
      
      try {
        // Get selected doctor
        const doctor = getSelectedDoctor();
        if (!doctor) {
          throw new Error('Selected doctor not found');
        }
        
        // Prepare registration data
        const registrationData: CompleteRegistrationData = {
          // Patient data
          full_name: patientDetails.fullName,
          contact_number: patientDetails.contactNumber,
          age: parseInt(patientDetails.age),
          date_of_birth: patientDetails.dateOfBirth || undefined,
          email: patientDetails.email || undefined,
          blood_group: patientDetails.bloodGroup,
          gender: patientDetails.gender as 'Male' | 'Female' | 'Other',
          address: patientDetails.address,
          initial_vital_signs: {
            blood_pressure: patientDetails.bloodPressure || undefined,
            heart_rate: patientDetails.heartRate || undefined,
            temperature: patientDetails.temperature || undefined,
            weight: patientDetails.weight || undefined
          },
          
          // Registration data
          doctor_id: doctor.id,
          registration_type: registrationType as 'IP' | 'OP',
          appointment_date: selectedDate,
          
          // IP-specific data
          ...(registrationType === 'IP' && {
            guardian_name: patientDetails.guardianName,
            guardian_relationship: patientDetails.guardianRelationship,
            admission_date: patientDetails.admissionDate,
            admission_time: patientDetails.admissionTime,
            admission_type: patientDetails.admissionType,
            ip_department: patientDetails.ipDepartment,
            room_number: patientDetails.roomNumber
          }),
          
          // OP-specific data
          ...(registrationType === 'OP' && {
            appointment_time: patientDetails.appointmentTime,
            consultation_type: patientDetails.consultationType,
            symptoms: patientDetails.symptoms || undefined,
            referred_by: patientDetails.referredBy || undefined,
            priority: patientDetails.priority
          }),

          // Payment data
          payment_method: patientDetails.paymentMethod || undefined,
          payment_amount: patientDetails.paymentAmount
            ? Math.round(Number(patientDetails.paymentAmount) * 100) / 100
            : undefined
        };
        
        // Submit to database
        const result = await DatabaseService.createCompleteRegistration(registrationData);
        
        if (result.success) {
          setRegistrationResult(result);
          setShowConfirmation(true);
        } else {
          throw new Error(result.error || 'Registration failed');
        }
        
      } catch (error) {
        console.error('Registration error:', error);
        alert(`Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const getSelectedDoctor = () => {
    return doctors.find(doctor => doctor.id === selectedDoctor);
  };

  const getSelectedRegistrationType = () => {
    return registrationTypes.find(type => type.id === registrationType);
  };

  const handlePreviewAndPrint = () => {
    const doctor = getSelectedDoctor();
    if (!doctor || !registrationResult) return;

    const previewData = {
      patient: {
        patient_id: registrationResult.patient?.patient_id || 'AAYUSH-XXXXXX',
        full_name: patientDetails.fullName,
        age: parseInt(patientDetails.age),
        gender: patientDetails.gender,
        address: patientDetails.address,
        contact_number: patientDetails.contactNumber
      },
      registration: {
        registration_type: registrationType,
        appointment_date: selectedDate,
        appointment_time: registrationType === 'OP' ? patientDetails.appointmentTime : patientDetails.admissionTime,
        consultation_type: patientDetails.consultationType,
        ip_department: patientDetails.ipDepartment
      },
      doctor: {
        name: doctor.name,
        specialization: doctor.specialization
      }
    };

    navigate('/registration-preview', { state: previewData });
  };

  if (showConfirmation) {
    const doctor = getSelectedDoctor();
    const regType = getSelectedRegistrationType();
    
    // Get patient ID from registration result
    const patientId = registrationResult?.patient?.patient_id || 'AAYUSH-XXXXXX';
    
    return (
      <div className="py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h1
  className="text-3xl font-semibold mb-3"
  style={{ color: "#824593" }}
>
  Registration Successful!
</h1>

<p
  className="mt-2 text-lg"
  style={{ color: "#824593" }}
>
  Patient registration has been completed successfully
</p>
          </div>

          {/* Confirmation Summary */}
          <div className="bg-white shadow-sm rounded-xl p-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Registration Summary</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Doctor & Appointment Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Doctor & Appointment</h3>
                  <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                    <img
                      className="h-12 w-12 rounded-full object-cover"
                      src={doctor?.avatar}
                      alt={doctor?.name}
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{doctor?.name}</p>
                      <p className="text-sm text-blue-600">{doctor?.specialization}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(selectedDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Type</p>
                    <p className="text-lg font-semibold text-gray-900">{regType?.name}</p>
                  </div>
                </div>
              </div>

              {/* Patient Details */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Patient Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Patient ID:</span>
                    <span className="text-sm font-semibold text-blue-600">{patientId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Full Name:</span>
                    <span className="text-sm text-gray-900">{patientDetails.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Contact:</span>
                    <span className="text-sm text-gray-900">{patientDetails.contactNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Age:</span>
                    <span className="text-sm text-gray-900">{patientDetails.age} years</span>
                  </div>
                  {patientDetails.dateOfBirth && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-500">Date of Birth:</span>
                      <span className="text-sm text-gray-900">{patientDetails.dateOfBirth}</span>
                    </div>
                  )}
                  {patientDetails.email && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-500">Email:</span>
                      <span className="text-sm text-gray-900">{patientDetails.email}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Blood Group:</span>
                    <span className="text-sm text-gray-900">{patientDetails.bloodGroup}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Gender:</span>
                    <span className="text-sm text-gray-900">{patientDetails.gender}</span>
                  </div>
                  
                  {/* IP-specific details in confirmation */}
                  {registrationType === 'IP' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500">Guardian:</span>
                        <span className="text-sm text-gray-900">{patientDetails.guardianName} ({patientDetails.guardianRelationship})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500">Admission:</span>
                        <span className="text-sm text-gray-900">{patientDetails.admissionDate} at {patientDetails.admissionTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500">Admission Type:</span>
                        <span className="text-sm text-gray-900">{patientDetails.admissionType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500">Department:</span>
                        <span className="text-sm text-gray-900">{patientDetails.ipDepartment}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500">Room:</span>
                        <span className="text-sm text-gray-900">{patientDetails.roomNumber}</span>
                      </div>
                    </>
                  )}
                  
                  {/* OP-specific details in confirmation */}
                  {registrationType === 'OP' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500">Appointment Time:</span>
                        <span className="text-sm text-gray-900">{patientDetails.appointmentTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500">Consultation Type:</span>
                        <span className="text-sm text-gray-900">{patientDetails.consultationType}</span>
                      </div>
                      {patientDetails.symptoms && (
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500">Symptoms:</span>
                          <span className="text-sm text-gray-900">{patientDetails.symptoms}</span>
                        </div>
                      )}
                      {patientDetails.referredBy && (
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500">Referred By:</span>
                          <span className="text-sm text-gray-900">{patientDetails.referredBy}</span>
                        </div>
                      )}
                    </>
                  )}
                  
                  <div className="pt-2 border-t border-gray-200">
                    <span className="text-sm font-medium text-gray-500">Address:</span>
                    <p className="text-sm text-gray-900 mt-1">{patientDetails.address}</p>
                  </div>

                  {patientDetails.paymentMethod && (
                    <>
                      <div className="flex justify-between pt-2 border-t border-gray-200">
                        <span className="text-sm font-medium text-gray-500">Payment Method:</span>
                        <span className="text-sm text-gray-900">{patientDetails.paymentMethod}</span>
                      </div>
                      {patientDetails.paymentAmount && (
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500">Amount Paid:</span>
                          <span className="text-sm font-semibold text-green-600">₹{patientDetails.paymentAmount}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Initial Vital Signs in Summary */}
            {(patientDetails.bloodPressure || patientDetails.heartRate || patientDetails.temperature || patientDetails.weight) && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Initial Vital Signs</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {patientDetails.bloodPressure && (
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-xs font-medium text-gray-500">Blood Pressure</p>
                      <p className="text-sm font-semibold text-gray-900">{patientDetails.bloodPressure}</p>
                    </div>
                  )}
                  {patientDetails.heartRate && (
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-xs font-medium text-gray-500">Heart Rate</p>
                      <p className="text-sm font-semibold text-gray-900">{patientDetails.heartRate}</p>
                    </div>
                  )}
                  {patientDetails.temperature && (
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-xs font-medium text-gray-500">Temperature</p>
                      <p className="text-sm font-semibold text-gray-900">{patientDetails.temperature}</p>
                    </div>
                  )}
                  {patientDetails.weight && (
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-xs font-medium text-gray-500">Weight</p>
                      <p className="text-sm font-semibold text-gray-900">{patientDetails.weight}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => setShowConfirmation(false)}
              className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Form
            </button>
            <button
              onClick={handlePreviewAndPrint}
              className="inline-flex items-center px-6 py-3 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
            >
              <FileText className="h-4 w-4 mr-2" />
              Preview & Print
            </button>
            <button
              onClick={() => {
                // Reset form for new registration
                setSelectedDoctor('');
                setSelectedDate(getCurrentISTDate());
                setRegistrationType('');
                setPatientDetails({
                  fullName: '',
                  contactNumber: '',
                  age: '',
                  dateOfBirth: '',
                  email: '',
                  bloodGroup: '',
                  gender: '',
                  address: '',
                  timestamp: new Date().toISOString(),
                  paymentMethod: '',
                  paymentAmount: '',
                  bloodPressure: '',
                  heartRate: '',
                  temperature: '',
                  weight: '',
                  guardianName: '',
                  guardianRelationship: '',
                  admissionDate: getCurrentISTDate(),
                  admissionTime: getCurrentISTTime(),
                  admissionType: '',
                  ipDepartment: '',
                  roomNumber: '',
                  appointmentTime: getCurrentISTTime(),
                  consultationType: '',
                  symptoms: '',
                  referredBy: ''
                });
                setRegistrationResult(null);
                setAvailableRooms([]);
                setShowConfirmation(false);
              }}
              className="inline-flex items-center px-6 py-3 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Register Another Patient
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mt-8 mb-5">
          <h1 className="text-2xl font-bold text-gray-800" style={{ color: '#7c3b92' }}>Patient Registration</h1>
          <p className="mt-2 text-sm text-gray-600">
            Select your preferred doctor, appointment date, and registration type
          </p>
        </div>

        <div className="space-y-4">
          {/* Doctor Selection */}
          <div className="bg-white shadow-sm rounded-lg p-4">
            <div className="flex items-center mb-6">
              <div className="bg-blue-100 rounded-md p-1.5 mr-2">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h2 className="text-base font-medium text-gray-900">Select Doctor</h2>
                <p className="text-xs text-gray-600">Choose your preferred consulting physician</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  onClick={() => setSelectedDoctor(doctor.id)}
                  className={`relative p-3 border-2 rounded-lg cursor-pointer transition-all duration-150 hover:shadow-sm ${
                    selectedDoctor === doctor.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {selectedDoctor === doctor.id && (
                    <div className="absolute top-2 right-2 bg-blue-600 rounded-full p-0.5">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                  
                  <div className="flex items-start space-x-3">
                    <img
                      className="h-12 w-12 rounded-full object-cover border border-gray-200"
                      src={doctor.avatar}
                      alt={doctor.name}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 mb-0.5">{doctor.name}</h3>
                      <p className="text-blue-600 font-medium text-xs mb-1">{doctor.title}</p>
                      <div className="space-y-0.5">
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-3 w-3 mr-1" />
                          {doctor.experience}
                        </div>
                        <div className="flex items-center text-sm text-green-600">
                          <div className="h-1.5 w-1.5 bg-green-500 rounded-full mr-1"></div>
                          {doctor.availability}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Date Selection */}
          <div className="bg-white shadow-sm rounded-lg p-4">
            <div className="flex items-center mb-6">
              <div className="bg-green-100 rounded-md p-1.5 mr-2">
                <Calendar className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h2 className="text-base font-medium text-gray-900">Select Date</h2>
                <p className="text-xs text-gray-600">Choose your preferred appointment date</p>
              </div>
            </div>

            <div className="max-w-md">
              <label htmlFor="appointmentDate" className="block text-xs font-medium text-gray-700 mb-1">
                Appointment Date *
              </label>
              <input
                type="date"
                id="appointmentDate"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="form-input"
                required
              />
            </div>
          </div>

          {/* Registration Type Selection */}
          <div className="bg-white shadow-sm rounded-lg p-4">
            <div className="flex items-center mb-6">
              <div className="bg-purple-100 rounded-md p-1.5 mr-2">
                <Building className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <h2 className="text-base font-medium text-gray-900">Registration Type</h2>
                <p className="text-xs text-gray-600">Choose the type of medical service you need</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {registrationTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <div
                    key={type.id}
                    onClick={() => setRegistrationType(type.id)}
                    className={`relative p-3 border-2 rounded-lg cursor-pointer transition-all duration-150 hover:shadow-sm ${
                      registrationType === type.id
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {registrationType === type.id && (
                      <div className="absolute top-2 right-2 bg-blue-600 rounded-full p-0.5">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                    
                    <div className="text-center">
                      <div className={`inline-flex items-center justify-center w-10 h-10 ${
                        type.color === 'blue' ? 'bg-blue-100' : 'bg-green-100'
                      } rounded-full mb-2`}>
                        <Icon className={`h-5 w-5 ${
                          type.color === 'blue' ? 'text-blue-600' : 'text-green-600'
                        }`} />
                      </div>
                      <h3 className="text-sm font-medium text-gray-900 mb-1">{type.name}</h3>
                      <p className="text-gray-600 text-xs mb-2">{type.description}</p>
                      
                      <div className="space-y-1">
                        {type.features.map((feature, index) => (
                          <div key={index} className="flex items-center text-xs text-gray-600">
                            <Check className="h-2 w-2 text-green-500 mr-1 flex-shrink-0" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Patient Details Form - Only show when steps 1-3 are valid */}
          {isStep1to3Valid && (
            <div className="bg-white shadow-sm rounded-lg p-4 animate-in slide-in-from-top duration-300">
              <div className="flex items-center mb-6">
                <div className="bg-indigo-100 rounded-md p-1.5 mr-2">
                  <User className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-base font-medium text-gray-900">Patient Details</h2>
                  <p className="text-xs text-gray-600">Please provide the patient's information</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Full Name */}
                <div className="md:col-span-2">
                  <label htmlFor="fullName" className="block text-xs font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    value={patientDetails.fullName}
                    onChange={(e) => handlePatientDetailChange('fullName', e.target.value)}
                    className="form-input"
                    placeholder="Enter patient's full name"
                    required
                  />
                </div>

                {/* Contact Number */}
                <div>
                  <label htmlFor="contactNumber" className="block text-xs font-medium text-gray-700 mb-1">
                    Contact Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      id="contactNumber"
                      value={patientDetails.contactNumber}
                      onChange={(e) => handleContactNumberChange(e.target.value)}
                      className="form-input pl-8"
                      placeholder="1234567890"
                      required
                    />
                  </div>
                </div>

                {/* Age */}
                <div>
                  <label htmlFor="age" className="block text-xs font-medium text-gray-700 mb-1">
                    Age *
                  </label>
                  <input
                    type="number"
                    id="age"
                    value={patientDetails.age}
                    onChange={(e) => handleAgeChange(e.target.value)}
                    className="form-input"
                    placeholder="25"
                    min="0"
                    max="150"
                    required
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label htmlFor="dateOfBirth" className="block text-xs font-medium text-gray-700 mb-1">
                    Date of Birth (Optional)
                  </label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    value={patientDetails.dateOfBirth}
                    onChange={(e) => handlePatientDetailChange('dateOfBirth', e.target.value)}
                    className="form-input"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {/* Email ID */}
                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
                    Email ID (Optional)
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      value={patientDetails.email}
                      onChange={(e) => handlePatientDetailChange('email', e.target.value)}
                      className="form-input pl-8"
                      placeholder="patient@example.com"
                    />
                  </div>
                </div>

                {/* Blood Group */}
                <div>
                  <label htmlFor="bloodGroup" className="block text-xs font-medium text-gray-700 mb-1">
                    Blood Group *
                  </label>
                  <select
                    id="bloodGroup"
                    value={patientDetails.bloodGroup}
                    onChange={(e) => handlePatientDetailChange('bloodGroup', e.target.value)}
                    className="form-input"
                    required
                  >
                    <option value="">Select Blood Group</option>
                    {bloodGroupOptions.map((group) => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>

                {/* Gender */}
                <div>
                  <label htmlFor="gender" className="block text-xs font-medium text-gray-700 mb-1">
                    Gender *
                  </label>
                  <select
                    id="gender"
                    value={patientDetails.gender}
                    onChange={(e) => handlePatientDetailChange('gender', e.target.value)}
                    className="form-input"
                    required
                  >
                    <option value="">Select Gender</option>
                    {genders.map((gender) => (
                      <option key={gender} value={gender}>{gender}</option>
                    ))}
                  </select>
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-xs font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-2 top-2 h-4 w-4 text-gray-400" />
                    <textarea
                      id="address"
                      value={patientDetails.address}
                      onChange={(e) => handlePatientDetailChange('address', e.target.value)}
                      rows={3}
                      className="form-input pl-8 resize-none"
                      placeholder="Enter complete address including city, state, and postal code"
                      required
                    />
                  </div>
                </div>

                {/* Hidden timestamp field for analytics */}
                <input
                  type="hidden"
                  value={patientDetails.timestamp}
                  readOnly
                />
              </div>

              {/* Payment Details Section */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center mb-6">
                  <div className="bg-orange-100 rounded-md p-1.5 mr-2">
                    <Activity className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-gray-900">Payment Details</h3>
                    <p className="text-xs text-gray-600">Optional - Record payment information for this registration</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Payment Method */}
                  <div>
                    <label htmlFor="paymentMethod" className="block text-xs font-medium text-gray-700 mb-1">
                      Payment Method (Optional)
                    </label>
                    <select
                      id="paymentMethod"
                      value={patientDetails.paymentMethod}
                      onChange={(e) => handlePatientDetailChange('paymentMethod', e.target.value)}
                      className="form-input"
                    >
                      <option value="">Select Payment Method</option>
                      {paymentMethods.map((method) => (
                        <option key={method} value={method}>{method}</option>
                      ))}
                    </select>
                  </div>

                  {/* Payment Amount */}
                  <div>
                    <label htmlFor="paymentAmount" className="block text-xs font-medium text-gray-700 mb-1">
                      Payment Amount (Optional)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                      <input
                        type="number"
                        id="paymentAmount"
                        value={patientDetails.paymentAmount}
                        onChange={(e) => handlePatientDetailChange('paymentAmount', e.target.value)}
                        className="form-input pl-6"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Initial Vital Signs Section */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center mb-6">
                  <div className="bg-green-100 rounded-md p-1.5 mr-2">
                    <Activity className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-gray-900">Initial Vital Signs</h3>
                    <p className="text-xs text-gray-600">Optional - Record patient's initial vital measurements</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Blood Pressure */}
                  <div>
                    <label htmlFor="bloodPressure" className="block text-xs font-medium text-gray-700 mb-1">
                      Blood Pressure (Optional)
                    </label>
                    <input
                      type="text"
                      id="bloodPressure"
                      value={patientDetails.bloodPressure}
                      onChange={(e) => handlePatientDetailChange('bloodPressure', e.target.value)}
                      className="form-input"
                      placeholder="120/80 mmHg"
                    />
                  </div>

                  {/* Heart Rate */}
                  <div>
                    <label htmlFor="heartRate" className="block text-xs font-medium text-gray-700 mb-1">
                      Heart Rate (Optional)
                    </label>
                    <input
                      type="text"
                      id="heartRate"
                      value={patientDetails.heartRate}
                      onChange={(e) => handlePatientDetailChange('heartRate', e.target.value)}
                      className="form-input"
                      placeholder="72 bpm"
                    />
                  </div>

                  {/* Temperature */}
                  <div>
                    <label htmlFor="temperature" className="block text-xs font-medium text-gray-700 mb-1">
                      Temperature (Optional)
                    </label>
                    <input
                      type="text"
                      id="temperature"
                      value={patientDetails.temperature}
                      onChange={(e) => handlePatientDetailChange('temperature', e.target.value)}
                      className="form-input"
                      placeholder="98.6°F"
                    />
                  </div>

                  {/* Weight */}
                  <div>
                    <label htmlFor="weight" className="block text-xs font-medium text-gray-700 mb-1">
                      Weight (Optional)
                    </label>
                    <input
                      type="text"
                      id="weight"
                      value={patientDetails.weight}
                      onChange={(e) => handlePatientDetailChange('weight', e.target.value)}
                      className="form-input"
                      placeholder="185 lbs"
                    />
                  </div>
                </div>
              </div>
              
              {/* IP-Specific Fields - Only show when IP is selected */}
              {registrationType === 'IP' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center mb-6">
                    <div className="bg-red-100 rounded-md p-1.5 mr-2">
                      <Building className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-medium text-gray-900">Inpatient Admission Details</h3>
                      <p className="text-xs text-gray-600">Additional information required for hospital admission</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Guardian Name */}
                    <div>
                      <label htmlFor="guardianName" className="block text-xs font-medium text-gray-700 mb-1">
                        Guardian Name *
                      </label>
                      <input
                        type="text"
                        id="guardianName"
                        value={patientDetails.guardianName}
                        onChange={(e) => handlePatientDetailChange('guardianName', e.target.value)}
                        className="form-input"
                        placeholder="Enter guardian's full name"
                        required
                      />
                    </div>

                    {/* Guardian Relationship */}
                    <div>
                      <label htmlFor="guardianRelationship" className="block text-xs font-medium text-gray-700 mb-1">
                        Relationship *
                      </label>
                      <select
                        id="guardianRelationship"
                        value={patientDetails.guardianRelationship}
                        onChange={(e) => handlePatientDetailChange('guardianRelationship', e.target.value)}
                        className="form-input"
                        required
                      >
                        <option value="">Select Relationship</option>
                        {guardianRelationships.map((relationship) => (
                          <option key={relationship} value={relationship}>{relationship}</option>
                        ))}
                      </select>
                    </div>

                    {/* Admission Date */}
                    <div>
                      <label htmlFor="admissionDate" className="block text-xs font-medium text-gray-700 mb-1">
                        Admission Date *
                      </label>
                      <input
                        type="date"
                        id="admissionDate"
                        value={patientDetails.admissionDate}
                        onChange={(e) => handlePatientDetailChange('admissionDate', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="form-input"
                        required
                      />
                    </div>

                    {/* Admission Time */}
                    <div>
                      <label htmlFor="admissionTime" className="block text-xs font-medium text-gray-700 mb-1">
                        Admission Time *
                      </label>
                      <input
                        type="time"
                        id="admissionTime"
                        value={patientDetails.admissionTime}
                        onChange={(e) => handlePatientDetailChange('admissionTime', e.target.value)}
                        className="form-input"
                        required
                      />
                    </div>

                    {/* Admission Type */}
                    <div>
                      <label htmlFor="admissionType" className="block text-xs font-medium text-gray-700 mb-1">
                        Admission Type *
                      </label>
                      <select
                        id="admissionType"
                        value={patientDetails.admissionType}
                        onChange={(e) => handlePatientDetailChange('admissionType', e.target.value)}
                        className="form-input"
                        required
                      >
                        <option value="">Select Admission Type</option>
                        {admissionTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    {/* Department */}
                    <div>
                      <label htmlFor="ipDepartment" className="block text-xs font-medium text-gray-700 mb-1">
                        Department *
                      </label>
                      <select
                        id="ipDepartment"
                        value={patientDetails.ipDepartment}
                        onChange={(e) => handlePatientDetailChange('ipDepartment', e.target.value)}
                        className="form-input"
                        required
                      >
                        <option value="">Select Department</option>
                        {ipDepartments.map((dept) => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>

                    {/* Room Number */}
                    <div className="md:col-span-2">
                      <label htmlFor="roomNumber" className="block text-xs font-medium text-gray-700 mb-1">
                        Room Number * {loadingRooms && <span className="text-gray-500 text-xs">(Loading available rooms...)</span>}
                      </label>
                      <select
                        id="roomNumber"
                        value={patientDetails.roomNumber}
                        onChange={(e) => handlePatientDetailChange('roomNumber', e.target.value)}
                        className="form-input"
                        required
                        disabled={loadingRooms}
                      >
                        <option value="">
                          {loadingRooms ? 'Loading rooms...' : availableRooms.length === 0 ? 'No rooms available' : 'Select Room Number'}
                        </option>
                        {availableRooms.map((room) => (
                          <option key={room} value={room}>{room}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
              
              {/* OP-Specific Fields - Only show when OP is selected */}
              {registrationType === 'OP' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center mb-6">
                    <div className="bg-blue-100 rounded-md p-1.5 mr-2">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-medium text-gray-900">Outpatient Consultation Details</h3>
                      <p className="text-xs text-gray-600">Additional information for outpatient consultation</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Appointment Time */}
                    <div>
                      <label htmlFor="appointmentTime" className="block text-xs font-medium text-gray-700 mb-1">
                        Appointment Time *
                      </label>
                      <input
                        type="time"
                        id="appointmentTime"
                        value={patientDetails.appointmentTime}
                        onChange={(e) => handlePatientDetailChange('appointmentTime', e.target.value)}
                        className="form-input"
                        required
                      />
                    </div>

                    {/* Consultation Type */}
                    <div>
                      <label htmlFor="consultationType" className="block text-xs font-medium text-gray-700 mb-1">
                        Consultation Type *
                      </label>
                      <select
                        id="consultationType"
                        value={patientDetails.consultationType}
                        onChange={(e) => handlePatientDetailChange('consultationType', e.target.value)}
                        className="form-input"
                        required
                      >
                        <option value="">Select Consultation Type</option>
                        {consultationTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    {/* Symptoms */}
                    <div className="md:col-span-2">
                      <label htmlFor="symptoms" className="block text-xs font-medium text-gray-700 mb-1">
                        Symptoms (Optional)
                      </label>
                      <textarea
                        id="symptoms"
                        value={patientDetails.symptoms}
                        onChange={(e) => handlePatientDetailChange('symptoms', e.target.value)}
                        rows={3}
                        className="form-input resize-none"
                        placeholder="Describe patient's symptoms or chief complaints"
                      />
                    </div>

                    {/* Referred By */}
                    <div>
                      <label htmlFor="referredBy" className="block text-xs font-medium text-gray-700 mb-1">
                        Referred By <span className="text-gray-400">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        id="referredBy"
                        value={patientDetails.referredBy}
                        onChange={(e) => handlePatientDetailChange('referredBy', e.target.value)}
                        className="form-input"
                        placeholder="Referring doctor or clinic name"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Register Patient Button */}
          {isStep1to3Valid && (
            <div className="bg-white shadow-sm rounded-lg p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
                <div className="text-xs text-gray-600">
                  {!isFormComplete ? (
                    <span className="flex items-center">
                      <div className="h-1.5 w-1.5 bg-orange-500 rounded-full mr-1"></div>
                      Please complete all {registrationType === 'IP' ? 'patient and admission' : 'patient'} details to proceed
                    </span>
                  ) : (
                    <span className="flex items-center text-green-600">
                      <Check className="h-3 w-3 mr-1" />
                      All {registrationType === 'IP' ? 'patient and admission' : 'patient'} information completed - Ready to register
                    </span>
                  )}
                </div>
                
                <button
                  onClick={handleRegisterPatient}
                  disabled={!isFormComplete || isSubmitting}
                  className={`btn-primary ${
                    isFormComplete && !isSubmitting
                      ? ''
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? 'Registering...' : 'Register Patient'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Registration;