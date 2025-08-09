import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast";
import DebugData from "../components/DebugData";

// Environment-based URL selection
const isDevelopment = import.meta.env.DEV;
const GOOGLE_SCRIPT_URL = isDevelopment
	? "/api/google-script" // Use Vite proxy in development
	: "https://script.google.com/macros/s/AKfycby8YgdngfyuTXX9Vo4PsR_1y-oTfbN0QlVwYndV_OUUlt5g5XgTwHWGmNg11erShbE/exec"; // Direct URL in production

export default function Leads() {
	const [leads, setLeads] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [toast, setToast] = useState(null);
	const [debugData, setDebugData] = useState(null);
	const navigate = useNavigate();

	useEffect(() => {
		fetchLeads();
	}, []);

	const fetchLeads = async () => {
		try {
			setLoading(true);
			setError(null);
			
			const response = await axios.get(GOOGLE_SCRIPT_URL, {
				timeout: 15000, // Increased timeout
				headers: {
					'Accept': 'application/json',
				}
			});

			console.log("Raw response data:", response.data);
			setDebugData(response.data); // Store for debugging

			// Check if response is HTML (error page)
			if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
				throw new Error('Received HTML error page from Google Script');
			}

			// Handle different data structures
			let leadsData = [];
			
			if (Array.isArray(response.data)) {
				leadsData = response.data;
			} else if (response.data && response.data.success === false) {
				throw new Error(response.data.error || 'Google Script returned an error');
			} else if (response.data && typeof response.data === "object") {
				// If it's an object, try to extract the data
				leadsData = response.data.data || response.data.leads || [];
			}

			// Filter out empty rows and ensure proper structure
			leadsData = leadsData.filter(
				(lead) => lead && (lead.Name || lead.name || lead.Email || lead.email)
			);

			// Normalize the data structure - handle both lowercase and uppercase keys
			const normalizedLeads = leadsData.map((lead) => ({
				Name: lead.Name || lead.name || "",
				Email: lead.Email || lead.email || "",
				Phone: lead.Phone || lead.phone || "",
				Message: lead.Message || lead.message || "",
				Date: formatDate(lead.Date || lead.date || lead.timestamp || ""),
			}));

			console.log("Normalized leads:", normalizedLeads);
			setLeads(normalizedLeads.reverse()); // Show newest first
			
			if (normalizedLeads.length === 0) {
				setToast({
					message: "No leads found in the sheet.",
					type: "info",
				});
			}
		} catch (error) {
			console.error("Error fetching leads:", error);
			let errorMessage = "Failed to load leads. ";
			
			if (error.code === 'ECONNABORTED') {
				errorMessage += "Request timed out. Please try again.";
			} else if (error.message.includes('HTML error page')) {
				errorMessage += "Google Script error. Please check your script deployment.";
			} else {
				errorMessage += error.message || "Please try again later.";
			}
			
			setError(errorMessage);
			setToast({
				message: errorMessage,
				type: "error",
			});
		} finally {
			setLoading(false);
		}
	};

	const formatDate = (dateValue) => {
		if (!dateValue) return "";
		
		try {
			// Handle different date formats
			const date = new Date(dateValue);
			if (isNaN(date.getTime())) return dateValue; // Return original if invalid
			
			return date.toLocaleDateString() + " " + date.toLocaleTimeString([], {
				hour: '2-digit',
				minute: '2-digit'
			});
		} catch {
			return dateValue;
		}
	};

	const handlePrint = (lead) => {
		const printWindow = window.open("", "", "width=800,height=600");
		printWindow.document.write(`
			<html>
				<head>
					<title>Print Lead</title>
					<style>
						body { font-family: Arial, sans-serif; margin: 20px; }
						h2 { color: #333; }
						p { margin: 10px 0; }
						strong { color: #555; }
					</style>
				</head>
				<body>
					<h2>Lead Details</h2>
					<p><strong>Name:</strong> ${lead.Name}</p>
					<p><strong>Email:</strong> ${lead.Email}</p>
					<p><strong>Phone:</strong> ${lead.Phone}</p>
					<p><strong>Message:</strong> ${lead.Message}</p>
					<p><strong>Date:</strong> ${lead.Date}</p>
					<script>window.print(); window.onafterprint = function(){ window.close(); }</script>
				</body>
			</html>
		`);
		printWindow.document.close();
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-white flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
					<p className="mt-4 text-gray-600">Loading leads...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-white p-4">
			{toast && (
				<Toast
					message={toast.message}
					type={toast.type}
					onClose={() => setToast(null)}
				/>
			)}

			{debugData && (
				<DebugData data={debugData} onClose={() => setDebugData(null)} />
			)}

			<div className="max-w-6xl mx-auto">
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-2xl font-semibold text-gray-800">My Leads</h2>
					<div className="flex space-x-2">
						<button
							onClick={fetchLeads}
							disabled={loading}
							className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
						>
							{loading ? "Refreshing..." : "🔄 Refresh"}
						</button>
						<button
							onClick={() => navigate("/")}
							className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
						>
							+ Add New Lead
						</button>
					</div>
				</div>

				{error && (
					<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
						{error}
						<button 
							onClick={() => setError(null)} 
							className="ml-2 text-red-800 hover:text-red-900"
						>
							✕
						</button>
					</div>
				)}

				{leads.length === 0 && !error ? (
					<div className="text-center py-12">
						<div className="text-gray-400 text-6xl mb-4">📋</div>
						<h3 className="text-xl font-medium text-gray-600 mb-2">
							No leads yet
						</h3>
						<p className="text-gray-500">Start by adding your first lead!</p>
						<button
							onClick={() => navigate("/")}
							className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
						>
							Add New Lead
						</button>
					</div>
				) : (
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
									<tr
										key={idx}
										className="border-t border-gray-100 hover:bg-gray-50"
									>
										<td className="py-3 px-4 font-medium">{lead.Name}</td>
										<td className="py-3 px-4">{lead.Email}</td>
										<td className="py-3 px-4">{lead.Phone}</td>
										<td className="py-3 px-4 max-w-xs">
											<div className="truncate" title={lead.Message}>
												{lead.Message}
											</div>
										</td>
										<td className="py-3 px-4 text-sm text-gray-600">{lead.Date}</td>
										<td className="py-3 px-4">
											<button
												onClick={() => handlePrint(lead)}
												className="text-blue-600 hover:text-blue-800 hover:underline transition"
											>
												Print
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
}