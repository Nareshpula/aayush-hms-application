import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  Heart,
  Activity,
  FileText,
  Pill,
  Clock
} from 'lucide-react';

const PatientProfile: React.FC = () => {
  const { id } = useParams();

  // Mock patient data
  const patient = {
    id: parseInt(id || '1'),
    name: 'John Smith',
    age: 45,
    gender: 'Male',
    phone: '+1 (555) 123-4567',
    email: 'john.smith@email.com',
    address: '123 Main Street, New York, NY 10001',
    bloodType: 'O+',
    allergies: ['Penicillin', 'Nuts'],
    condition: 'Hypertension',
    lastVisit: '2024-01-15',
    status: 'Active',
    avatar: 'https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2&fit=crop',
    emergencyContact: {
      name: 'Jane Smith',
      relationship: 'Spouse',
      phone: '+1 (555) 987-6543'
    }
  };

  const vitals = [
    { label: 'Blood Pressure', value: '140/90 mmHg', status: 'high' },
    { label: 'Heart Rate', value: '72 bpm', status: 'normal' },
    { label: 'Temperature', value: '98.6°F', status: 'normal' },
    { label: 'Weight', value: '185 lbs', status: 'normal' },
  ];

  const appointments = [
    { date: '2024-01-15', time: '10:00 AM', doctor: 'Dr. Sarah Wilson', type: 'Follow-up', status: 'Completed' },
    { date: '2024-01-22', time: '2:00 PM', doctor: 'Dr. Michael Chen', type: 'Cardiology', status: 'Scheduled' },
    { date: '2024-02-05', time: '11:00 AM', doctor: 'Dr. Sarah Wilson', type: 'Check-up', status: 'Scheduled' },
  ];

  const medications = [
    { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', prescribed: 'Dr. Sarah Wilson' },
    { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', prescribed: 'Dr. Sarah Wilson' },
    { name: 'Aspirin', dosage: '81mg', frequency: 'Once daily', prescribed: 'Dr. Michael Chen' },
  ];

  const getVitalStatus = (status: string) => {
    switch (status) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'low':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'normal':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <Link
              to="/patients"
              className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Patients
            </Link>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Patient Profile</h1>
            <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Information */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Patient Information</h3>
              </div>
              <div className="p-6">
                <div className="text-center mb-6">
                  <img
                    className="h-24 w-24 rounded-full mx-auto object-cover"
                    src={patient.avatar}
                    alt={patient.name}
                  />
                  <h2 className="mt-4 text-xl font-bold text-gray-900">{patient.name}</h2>
                  <p className="text-sm text-gray-500">{patient.gender}, {patient.age} years old</p>
                  <span className="inline-flex px-2 py-1 mt-2 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    {patient.status}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-900">{patient.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-900">{patient.email}</span>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <span className="text-sm text-gray-900">{patient.address}</span>
                  </div>
                  <div className="flex items-center">
                    <Heart className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-900">Blood Type: {patient.bloodType}</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Emergency Contact</h4>
                  <div className="text-sm text-gray-600">
                    <p>{patient.emergencyContact.name}</p>
                    <p className="text-gray-500">{patient.emergencyContact.relationship}</p>
                    <p>{patient.emergencyContact.phone}</p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Allergies</h4>
                  <div className="flex flex-wrap gap-2">
                    {patient.allergies.map((allergy, index) => (
                      <span
                        key={index}
                        className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800"
                      >
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vital Signs */}
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Latest Vital Signs</h3>
                <p className="mt-1 text-sm text-gray-500">Recorded on {patient.lastVisit}</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vitals.map((vital, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${getVitalStatus(vital.status)}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{vital.label}</p>
                          <p className="text-lg font-semibold mt-1">{vital.value}</p>
                        </div>
                        <Activity className="h-6 w-6" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Appointments */}
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Appointments</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {appointments.map((appointment, index) => (
                    <div key={index} className="flex items-center p-4 border border-gray-200 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="bg-blue-100 rounded-lg p-2">
                          <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {appointment.type} - {appointment.doctor}
                            </p>
                            <p className="text-sm text-gray-500">
                              {appointment.date} at {appointment.time}
                            </p>
                          </div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            appointment.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {appointment.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Current Medications */}
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Current Medications</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {medications.map((medication, index) => (
                    <div key={index} className="flex items-center p-4 border border-gray-200 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="bg-green-100 rounded-lg p-2">
                          <Pill className="h-5 w-5 text-green-600" />
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{medication.name}</p>
                            <p className="text-sm text-gray-500">
                              {medication.dosage} - {medication.frequency}
                            </p>
                            <p className="text-xs text-gray-400">Prescribed by {medication.prescribed}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;