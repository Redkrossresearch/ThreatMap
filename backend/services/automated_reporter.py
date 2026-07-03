import asyncio
import logging
import os
from datetime import datetime, timedelta
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors

from models.database import SessionLocal, Scan

logger = logging.getLogger(__name__)
REPORTS_DIR = "reports"

if not os.path.exists(REPORTS_DIR):
    os.makedirs(REPORTS_DIR)

def generate_daily_report():
    db = SessionLocal()
    try:
        now = datetime.utcnow()
        yesterday = now - timedelta(days=1)
        
        # Get high and critical scans
        scans = db.query(Scan).filter(
            Scan.created_at >= yesterday,
            Scan.risk_level.in_(["HIGH", "CRITICAL"])
        ).order_by(Scan.risk_score.desc()).limit(50).all()
        
        if not scans:
            logger.info("No high/critical scans found for daily report. Skipping PDF generation.")
            return

        filename = os.path.join(REPORTS_DIR, f"daily_threat_report_{now.strftime('%Y%m%d_%H%M%S')}.pdf")
        doc = SimpleDocTemplate(filename, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
        
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle("TitleStyle", parent=styles['Heading1'], fontName="Helvetica-Bold", fontSize=18, textColor=colors.darkred, spaceAfter=14)
        subtitle_style = ParagraphStyle("SubTitle", parent=styles['Normal'], fontName="Helvetica", fontSize=10, textColor=colors.gray, spaceAfter=20)
        
        elements = []
        elements.append(Paragraph("Automated Daily Threat Report", title_style))
        elements.append(Paragraph(f"<b>Generated At:</b> {now.strftime('%Y-%m-%d %H:%M UTC')}", subtitle_style))
        
        data = [["Indicator", "Type", "Risk Score", "Risk Level", "Date"]]
        for s in scans:
            data.append([
                str(s.indicator),
                str(s.type),
                str(s.risk_score),
                str(s.risk_level),
                s.created_at.strftime('%Y-%m-%d %H:%M')
            ])
            
        t = Table(data, colWidths=[150, 80, 80, 80, 120])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1f2937')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, 0), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f9fafb')),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
            ('ALIGN', (0, 1), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.lightgrey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f3f4f6')])
        ]))
        
        elements.append(t)
        doc.build(elements)
        logger.info(f"Daily automated report generated successfully: {filename}")
        
    except Exception as e:
        logger.error(f"Failed to generate daily automated report: {e}")
    finally:
        db.close()

async def automated_report_loop():
    logger.info("Starting Automated Reporting background task.")
    while True:
        # Generate immediately on start for demo purposes, then every 24 hours
        generate_daily_report()
        # Sleep for 24 hours (86400 seconds)
        await asyncio.sleep(86400)
