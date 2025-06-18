export async function exportAuditLogsToPDF(logs) {
  // Importação dinâmica dos módulos
  const jsPDFModule = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const jsPDF = jsPDFModule.default;
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Registo de Auditoria", 14, 18);

  const tableColumn = ["ID", "Utilizador", "ID Utilizador", "Descrição", "Data"];
  const tableRows = logs.map((log) => [
    log.id,
    log.userName,
    log.userID,
    log.description,
    new Date(log.date).toLocaleString()
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 28,
    styles: { fontSize: 10 }
  });

  doc.save("audit-log.pdf");
}
