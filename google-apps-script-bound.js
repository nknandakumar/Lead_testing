// Google Apps Script Code for Bound Script (created from Extensions → Apps Script)

// Function to handle CORS preflight requests
function doOptions(e) {
	const headers = {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type, Authorization",
		"Access-Control-Max-Age": "86400",
	};

	return ContentService.createTextOutput()
		.setMimeType(ContentService.MimeType.TEXT)
		.setHeaders(headers);
}

// Function to handle POST requests (form submissions)
function doPost(e) {
	try {
		// Set CORS headers
		const headers = {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, Authorization",
		};

		// Parse the incoming data
		const data = JSON.parse(e.postData.contents);

		// Get the spreadsheet (bound script)
		const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

		if (!spreadsheet) {
			throw new Error(
				"Spreadsheet not found. Please ensure the script is bound to a spreadsheet."
			);
		}

		const sheet = spreadsheet.getActiveSheet();
		const timestamp = new Date();

		// Append the data to the sheet
		sheet.appendRow([
			data.name || "",
			data.email || "",
			data.phone || "",
			data.message || "",
			timestamp,
		]);

		// Return success response with CORS headers
		return ContentService.createTextOutput(
			JSON.stringify({
				success: true,
				message: "Data saved successfully",
			})
		)
			.setMimeType(ContentService.MimeType.JSON)
			.setHeaders(headers);
	} catch (error) {
		console.error("Error in doPost:", error);

		// Return error response with CORS headers
		const headers = {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, Authorization",
		};

		return ContentService.createTextOutput(
			JSON.stringify({
				success: false,
				error: error.toString(),
			})
		)
			.setMimeType(ContentService.MimeType.JSON)
			.setHeaders(headers);
	}
}

// Function to handle GET requests (reading leads)
function doGet(e) {
	try {
		const headers = {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, Authorization",
		};

		// Get the spreadsheet (bound script)
		const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

		if (!spreadsheet) {
			throw new Error(
				"Spreadsheet not found. Please ensure the script is bound to a spreadsheet."
			);
		}

		const sheet = spreadsheet.getActiveSheet();
		const data = sheet.getDataRange().getValues();

		console.log("Raw sheet data:", data);

		// If no data, return empty array
		if (data.length <= 1) {
			return ContentService.createTextOutput(JSON.stringify([]))
				.setMimeType(ContentService.MimeType.JSON)
				.setHeaders(headers);
		}

		// Get headers from first row
		const headers_row = data[0];
		const rows = data.slice(1);

		console.log("Headers row:", headers_row);
		console.log("Data rows:", rows);

		// Convert to array of objects
		const leads = rows.map((row) => {
			const lead = {};
			headers_row.forEach((header, index) => {
				// Normalize header names to lowercase
				const normalizedHeader = header.toString().toLowerCase();
				lead[normalizedHeader] = row[index] || "";
			});
			return lead;
		});

		console.log("Processed leads:", leads);

		// Filter out completely empty rows
		const filteredLeads = leads.filter((lead) => {
			const hasData =
				lead.name || lead.email || lead.phone || lead.message || lead.date;
			console.log("Lead:", lead, "Has data:", hasData);
			return hasData;
		});

		console.log("Filtered leads:", filteredLeads);

		return ContentService.createTextOutput(JSON.stringify(filteredLeads))
			.setMimeType(ContentService.MimeType.JSON)
			.setHeaders(headers);
	} catch (error) {
		console.error("Error in doGet:", error);

		const headers = {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, Authorization",
		};

		return ContentService.createTextOutput(
			JSON.stringify({
				success: false,
				error: error.toString(),
			})
		)
			.setMimeType(ContentService.MimeType.JSON)
			.setHeaders(headers);
	}
}

