import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxT4M4qhhgLAjShM6wp1k4VfPuU0iCa6Xyhbejjp_qbk1ZDA9nZUWOqny_I75Rf2Bmz/exec';

export default function NewLead() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(GOOGLE_SCRIPT_URL, form);
      navigate('/leads');
    } catch (error) {
      console.error('Axios error:', error);
      alert('Failed to submit. Please check your network or script permissions.');
    }
  };
  
  

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-50 rounded-xl shadow-xl p-6">
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">New Lead</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {['name', 'email', 'phone'].map((field) => (
            <input
              key={field}
              type={field === 'email' ? 'email' : 'text'}
              name={field}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ))}
          <textarea
            name="message"
            placeholder="Message"
            rows="4"
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
