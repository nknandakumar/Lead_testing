import { useEffect, useState } from 'react';
import axios from 'axios';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxT4M4qhhgLAjShM6wp1k4VfPuU0iCa6Xyhbejjp_qbk1ZDA9nZUWOqny_I75Rf2Bmz/exec';

export default function Leads() {
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    axios.get(GOOGLE_SCRIPT_URL).then((res) => {
      setLeads(res.data.reverse());
    });
  }, []);

  const handlePrint = (lead) => {
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
      <html>
        <head><title>Print Lead</title></head>
        <body>
          <h2>Lead Details</h2>
          <p><strong>Name:</strong> ${lead.Name}</p>
          <p><strong>Email:</strong> ${lead.Email}</p>
          <p><strong>Phone:</strong> ${lead.Phone}</p>
          <p><strong>Message:</strong> ${lead.Message}</p>
          <p><strong>Date:</strong> ${lead.Date}</p>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-white p-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">My Leads</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
          <thead className="bg-gray-100 text-left text-sm text-gray-600 uppercase">
            <tr>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Phone</th>
              <th className="py-3 px-4">Message</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead, idx) => (
              <tr key={idx} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">{lead.Name}</td>
                <td className="py-3 px-4">{lead.Email}</td>
                <td className="py-3 px-4">{lead.Phone}</td>
                <td className="py-3 px-4">{lead.Message}</td>
                <td className="py-3 px-4">{lead.Date}</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => handlePrint(lead)}
                    className="text-blue-600 hover:underline"
                  >
                    Print
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
