/**
 * Utility to export JSON data to CSV format and trigger a browser download.
 */
export function exportToCSV(data: any[], filename: string) {
    if (!data || !data.length) {
        console.error("No data available for export.");
        return;
    }

    // Extract headers from the first object
    const headers = Object.keys(data[0]);

    // Create CSV rows
    const csvRows = [
        headers.join(","), // Header row
        ...data.map(row => {
            return headers.map(header => {
                const val = row[header];
                // Escape commas and wrap in quotes if necessary
                const escaped = ("" + val).replace(/"/g, '""');
                return `"${escaped}"`;
            }).join(",");
        })
    ].join("\n");

    // Create a blob and trigger download
    const blob = new Blob([csvRows], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
