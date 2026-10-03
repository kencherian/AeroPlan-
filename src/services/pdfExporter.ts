import { jsPDF } from 'jspdf';
import { AgentPlanOutput } from '../types.ts';

interface ExportPdfParams {
  output: AgentPlanOutput;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  destinationCity?: string;
}

export function exportItineraryPdf({
  output,
  origin,
  destination,
  departureDate,
  returnDate,
  destinationCity,
}: ExportPdfParams) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const primaryColor: [number, number, number] = [62, 56, 50]; // #3E3832
  const sageColor: [number, number, number] = [115, 131, 111]; // #73836F
  const terracottaColor: [number, number, number] = [200, 118, 110]; // #C8766E
  const mutedColor: [number, number, number] = [140, 130, 121]; // #8C8279
  const creamBg: [number, number, number] = [249, 246, 240]; // #F9F6F0

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
      drawHeaderFooter();
    }
  };

  const drawHeaderFooter = () => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...mutedColor);
    doc.text('AeroPlan Sanctuary · Peaceful Travel Companion', margin, 10);
    doc.text(
      `Page ${doc.getNumberOfPages()}`,
      pageWidth - margin,
      pageHeight - 8,
      { align: 'right' }
    );
  };

  drawHeaderFooter();

  // Top Title Banner
  doc.setFillColor(...creamBg);
  doc.roundedRect(margin, y, contentWidth, 24, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...primaryColor);
  doc.text('Peaceful Travel Itinerary & Financial Ledger', margin + 6, y + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...mutedColor);
  const cityLabel = destinationCity ? ` · ${destinationCity}` : '';
  doc.text(
    `Journey: ${origin} to ${destination}${cityLabel} | Dates: ${departureDate} to ${returnDate}`,
    margin + 6,
    y + 18
  );

  y += 30;

  // Financial Ledger Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...sageColor);
  doc.text('1. Financial Balance & Spending Summary', margin, y);
  y += 6;

  const { total_budget, total_spent, remaining_funds } = output.financials;
  const colW = contentWidth / 3;

  // 3 Ledger Cards
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(235, 230, 222);

  // Card 1
  doc.roundedRect(margin, y, colW - 3, 18, 2, 2, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...mutedColor);
  doc.text('Cozy Budget Goal', margin + 4, y + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...primaryColor);
  doc.text(`$${total_budget.toLocaleString()} USD`, margin + 4, y + 14);

  // Card 2
  doc.roundedRect(margin + colW, y, colW - 3, 18, 2, 2, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...mutedColor);
  doc.text('Total Committed', margin + colW + 4, y + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...terracottaColor);
  doc.text(`$${total_spent.toLocaleString()} USD`, margin + colW + 4, y + 14);

  // Card 3
  doc.roundedRect(margin + colW * 2, y, colW - 3, 18, 2, 2, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...mutedColor);
  doc.text('Remaining Pocket Funds', margin + colW * 2 + 4, y + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...sageColor);
  doc.text(`$${remaining_funds.toLocaleString()} USD`, margin + colW * 2 + 4, y + 14);

  y += 24;

  // Confirmed Bookings Section
  if (output.bookings) {
    checkPageBreak(36);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...sageColor);
    doc.text('2. Confirmed Travel Bookings', margin, y);
    y += 6;

    const halfW = (contentWidth - 4) / 2;

    // Flight Card
    doc.setFillColor(...creamBg);
    doc.roundedRect(margin, y, halfW, 26, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...terracottaColor);
    doc.text('ROUNDTRIP FLIGHT RESERVATION', margin + 4, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...primaryColor);
    doc.text(`PNR Reference: ${output.bookings.flight_pnr}`, margin + 4, y + 12);
    doc.text(`Route: ${origin} <-> ${destination}`, margin + 4, y + 17);
    doc.text(`Total Fare: $${output.bookings.flight_cost.toLocaleString()} USD`, margin + 4, y + 22);

    // Hotel Card
    doc.setFillColor(...creamBg);
    doc.roundedRect(margin + halfW + 4, y, halfW, 26, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...sageColor);
    doc.text('ACCOMMODATION CONFIRMATION', margin + halfW + 8, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...primaryColor);
    const hotelNameClean = output.bookings.hotel_name.length > 32 
      ? output.bookings.hotel_name.substring(0, 30) + '...'
      : output.bookings.hotel_name;
    doc.text(`Property: ${hotelNameClean}`, margin + halfW + 8, y + 12);
    doc.text(`Stay Duration: Full Trip Duration`, margin + halfW + 8, y + 17);
    doc.text(`Total Cost: $${output.bookings.hotel_total_cost.toLocaleString()} USD`, margin + halfW + 8, y + 22);

    y += 32;
  }

  // Daily Itinerary Section
  if (output.daily_itinerary && output.daily_itinerary.length > 0) {
    checkPageBreak(20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...sageColor);
    doc.text('3. Daily Itinerary & Mindful Atmospheric Forecasts', margin, y);
    y += 7;

    output.daily_itinerary.forEach((day) => {
      checkPageBreak(38);

      // Day Container Box
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(235, 230, 222);
      
      const agendaLines = day.agenda || [];
      const boxHeight = 22 + agendaLines.length * 5;

      doc.roundedRect(margin, y, contentWidth, boxHeight, 2, 2, 'FD');

      // Day Header inside box
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...primaryColor);
      doc.text(`Day ${day.day_number} · ${day.date}`, margin + 4, y + 6);

      // Weather badge on the right
      if (day.weather) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...terracottaColor);
        doc.text(
          `${day.weather.condition} · ${day.weather.temp_high_c}°C / ${day.weather.temp_high_f}°F (Low ${day.weather.temp_low_c}°C)`,
          pageWidth - margin - 4,
          y + 6,
          { align: 'right' }
        );

        if (day.weather.clothing_tip) {
          doc.setFontSize(7.5);
          doc.setTextColor(...mutedColor);
          doc.text(`Attire Tip: ${day.weather.clothing_tip}`, margin + 4, y + 11);
        }
      }

      // Agenda list
      let itemY = y + (day.weather ? 16 : 12);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...primaryColor);

      agendaLines.forEach((item, idx) => {
        const bullet = '• ';
        const splitText = doc.splitTextToSize(bullet + item, contentWidth - 8);
        doc.text(splitText, margin + 4, itemY);
        itemY += 5;
      });

      y += boxHeight + 4;
    });
  }

  // Footer note
  checkPageBreak(16);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(...mutedColor);
  doc.text(
    'Wishing you a tranquil, refreshing, and memorable journey. Safe and peaceful travels!',
    pageWidth / 2,
    y + 8,
    { align: 'center' }
  );

  // Save the PDF
  const filename = `AeroPlan-Itinerary-${origin}-${destination}-${departureDate}.pdf`;
  doc.save(filename);
}
