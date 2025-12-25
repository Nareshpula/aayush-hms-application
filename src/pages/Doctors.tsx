import React from 'react';
import { Search, Filter, Plus, Mail, Phone, Calendar, MapPin } from 'lucide-react';

const Doctors: React.FC = () => {
  const doctors = [
    {
      id: 1,
      name: 'Dr. G Sridhar',
      title: 'Senior Consultant in Pediatrics',
      specialization: 'Pediatrics',
      experience: '15+ years',
      phone: '+91 98765 43210',
      email: 'dr.sridhar@aayushhospital.com',
      department: 'Pediatrics',
      avatar: 'https://voaxktqgbljtsattacbn.supabase.co/storage/v1/object/sign/aayush-hospital/Header-Bar-Images/Doctors-Image/Doctor-Sridhar.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wNmRjYTIxMy05OWY0LTQyNmQtOWNjNC0yZjAwYjJhNzQ0MWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhYXl1c2gtaG9zcGl0YWwvSGVhZGVyLUJhci1JbWFnZXMvRG9jdG9ycy1JbWFnZS9Eb2N0b3ItU3JpZGhhci5qcGciLCJpYXQiOjE3NjQzNTYzNjQsImV4cCI6MTkyMjAzNjM2NH0.VdwwZmQB5_SZB4mvDR_sWvgsEyeH9FXUy3r_j3CJ35c'
    },
    {
      id: 2,
      name: 'Dr. Himabindu Sridhar',
      title: 'Consultant Dermatologist, Cosmetologist, Laser & Hair Transplant Surgeon',
      specialization: 'Dermatology & Cosmetology',
      experience: '12+ years',
      phone: '+91 98765 43211',
      email: 'dr.himabindu@aayushhospital.com',
      department: 'Dermatology',
      avatar: 'https://voaxktqgbljtsattacbn.supabase.co/storage/v1/object/sign/aayush-hospital/Header-Bar-Images/Doctors-Image/Himabindu-Image.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8wNmRjYTIxMy05OWY0LTQyNmQtOWNjNC0yZjAwYjJhNzQ0MWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhYXl1c2gtaG9zcGl0YWwvSGVhZGVyLUJhci1JbWFnZXMvRG9jdG9ycy1JbWFnZS9IaW1hYmluZHUtSW1hZ2UuanBnIiwiaWF0IjoxNzY0MzU2MjcyLCJleHAiOjE5MjIwMzYyNzJ9.vkPU66j20OoweBRY_-ccqwx8nIGAI6MO7YFClp_uevM'
    },
  ];

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mt-8 mb-5">
          <h1 className="text-2xl font-bold text-gray-800" style={{ color: '#7c3b92' }}>Aayush Hospital Doctors</h1>
          <p className="mt-2 text-sm text-gray-600">
            Meet our experienced medical professionals at Aayush Hospital.
          </p>
        </div>

        {/* Search */}
        <div className="mt-4 bg-white shadow-sm rounded-lg">
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 sm:space-x-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="form-input pl-9"
                  placeholder="Search doctors by name or specialization..."
                />
              </div>
            </div>
          </div>

          {/* Doctors Grid */}
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {doctors.map((doctor) => (
                <div key={doctor.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow duration-150">
                  <div className="text-center">
                    <img
                      className="h-16 w-16 rounded-full mx-auto object-cover border border-gray-200"
                      src={doctor.avatar}
                      alt={doctor.name}
                    />
                    <h3 className="mt-3 text-base font-medium text-gray-900">{doctor.name}</h3>
                    <p className="text-xs text-gray-600 mt-0.5">{doctor.title}</p>
                    <p className="text-xs text-blue-600 font-medium">{doctor.specialization}</p>
                    <p className="text-xs text-gray-500">{doctor.experience} experience</p>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-xs text-gray-600">
                      <Phone className="h-3 w-3 mr-2 text-gray-400" />
                      {doctor.phone}
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <Mail className="h-3 w-3 mr-2 text-gray-400" />
                      {doctor.email}
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <MapPin className="h-3 w-3 mr-2 text-gray-400" />
                      {doctor.department}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Doctors;